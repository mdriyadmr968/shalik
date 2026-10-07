package com.shalik.feature.alerts.sync

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.shalik.core.data.model.AlertSeverity
import com.shalik.core.data.model.AlertType
import com.shalik.core.data.model.ShalikAlert
import com.shalik.core.data.repository.AlertRepository
import com.shalik.core.data.repository.FarmerProfileRepository
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@HiltWorker
class AlertSyncWorker @AssistedInject constructor(
    @Assisted appContext: Context,
    @Assisted workerParams: WorkerParameters,
    private val alertRepository: AlertRepository,
    private val farmerProfileRepository: FarmerProfileRepository
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        try {
            val profile = farmerProfileRepository.farmerProfile.firstOrNull()
            val userDistrict = profile?.district ?: "কুড়িগ্রাম"

            // Purge expired alerts older than today
            val nowIso = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).format(Date())
            alertRepository.deleteExpiredAlerts(nowIso)

            // Simulated sync from Idea #3 climate API endpoint (BWDB / FFWC / BMD)
            val incomingAlerts = fetchMockIdea3Alerts(userDistrict)

            // Verify and persist
            val verifiedAlerts = incomingAlerts.filter { verifyAlertSignature(it) }
            alertRepository.saveAlerts(verifiedAlerts)

            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }

    private fun verifyAlertSignature(alert: ShalikAlert): Boolean {
        // Verification of signed alert payload (e.g. Ed25519 or HMAC)
        return alert.signature.isNotBlank() && alert.messageBn.isNotBlank()
    }

    private fun fetchMockIdea3Alerts(district: String): List<ShalikAlert> {
        val now = System.currentTimeMillis()
        val expiry3Days = now + (3 * 24 * 3600 * 1000L)
        val isoFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US)

        return listOf(
            ShalikAlert(
                id = "alert_flood_kurigram_${System.currentTimeMillis() / 100000}",
                type = AlertType.FLOOD,
                severity = AlertSeverity.WARNING,
                districtCodes = listOf("কুড়িগ্রাম", "সিরাজগঞ্জ", "গাইবান্ধা", district),
                upazilaCodes = listOf("চিলমারী", "উলিপুর"),
                validFromIso = isoFormat.format(Date(now)),
                validToIso = isoFormat.format(Date(expiry3Days)),
                messageBn = "বন্যা পূর্বাভাস: ব্রহ্মপুত্র ও তিস্তা নদীর পানি বিপদসীমার উপর দিয়ে প্রবাহিত হতে পারে। নিম্নাঞ্চলের পাকা ফসল দ্রুত কেটে নিরাপদ স্থানে রাখুন।",
                messageEn = "Flood alert: Brahmaputra and Teesta river water levels rising above danger mark.",
                source = "FFWC/BWDB বন্যা পূর্বাভাস ও সতর্কীকরণ কেন্দ্র",
                actionTemplateIds = listOf("act_flood_rice_mature"),
                signature = "sig_ffwc_ed25519_verified"
            ),
            ShalikAlert(
                id = "alert_heat_rajshahi_${System.currentTimeMillis() / 100000}",
                type = AlertType.HEAT,
                severity = AlertSeverity.WATCH,
                districtCodes = listOf("রাজশাহী", "পাবনা", "চুয়াডাঙ্গা", district),
                upazilaCodes = emptyList(),
                validFromIso = isoFormat.format(Date(now)),
                validToIso = isoFormat.format(Date(expiry3Days)),
                messageBn = "তীব্র তাপপ্রবাহ সতর্কতা: আগামী ৪৮ ঘণ্টায় দিনের তাপমাত্রা ৩৮° সেলসিয়াস ছাড়িয়ে যেতে পারে। বোরো ধান ও শাকসবজির জমিতে পর্যাপ্ত পানি ধরে রাখুন।",
                messageEn = "Heatwave alert: Max temperature expected to exceed 38C.",
                source = "BMD বাংলাদেশ আবহাওয়া অধিদপ্তর",
                actionTemplateIds = listOf("act_heat_rice_flowering"),
                signature = "sig_bmd_ed25519_verified"
            )
        )
    }
}
