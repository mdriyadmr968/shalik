package com.shalik.feature.alerts.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import com.shalik.core.data.model.AlertSeverity
import com.shalik.core.data.model.AlertType
import com.shalik.core.data.model.ShalikAlert
import com.shalik.core.data.repository.AlertRepository
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import javax.inject.Inject

@AndroidEntryPoint
class SmsAlertReceiver : BroadcastReceiver() {

    @Inject
    lateinit var alertRepository: AlertRepository

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return

        val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent) ?: return

        for (sms in messages) {
            val body = sms.displayMessageBody ?: continue
            val sender = sms.displayOriginatingAddress ?: ""

            // Format check: "SHALIK|<TYPE>|<SEV>|<DISTRICT>|<MSG>|<HMAC>"
            if (body.startsWith("SHALIK|", ignoreCase = true)) {
                val parsedAlert = parseSmsAlert(body, sender)
                if (parsedAlert != null) {
                    CoroutineScope(Dispatchers.IO).launch {
                        alertRepository.saveAlert(parsedAlert)
                    }
                }
            }
        }
    }

    companion object {
        fun parseSmsAlert(body: String, sender: String = "SMS_GATEWAY"): ShalikAlert? {
            val parts = body.split("|")
            if (parts.size < 6) return null

            val typeStr = parts[1].trim().uppercase()
            val sevStr = parts[2].trim()
            val district = parts[3].trim()
            val messageBn = parts[4].trim()
            val hmac = parts[5].trim()

            // HMAC or signature sanity check
            if (hmac.length < 4) return null

            val type = when (typeStr) {
                "HEAT" -> AlertType.HEAT
                "FLOOD" -> AlertType.FLOOD
                "CYCLONE" -> AlertType.CYCLONE
                "RAIN", "HEAVY_RAIN" -> AlertType.HEAVY_RAIN
                "COLD" -> AlertType.COLD
                else -> AlertType.HEAVY_RAIN
            }

            val sevLevel = sevStr.toIntOrNull() ?: 2
            val severity = AlertSeverity.entries.firstOrNull { it.level == sevLevel } ?: AlertSeverity.WATCH

            val now = System.currentTimeMillis()
            val isoFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US)
            val expiry = now + (2 * 24 * 3600 * 1000L) // 48h valid

            val actionTemplateId = when (type) {
                AlertType.FLOOD -> "act_flood_rice_mature"
                AlertType.HEAT -> "act_heat_rice_flowering"
                AlertType.HEAVY_RAIN -> "act_heavy_rain_drainage"
                AlertType.CYCLONE -> "act_cyclone_harvest"
                AlertType.COLD -> "act_cold_potato_blight"
            }

            return ShalikAlert(
                id = "sms_${System.currentTimeMillis()}",
                type = type,
                severity = severity,
                districtCodes = listOf(district),
                validFromIso = isoFormat.format(Date(now)),
                validToIso = isoFormat.format(Date(expiry)),
                messageBn = messageBn,
                messageEn = null,
                source = "কৃষি আবহাওয়া ও জরুরি এসএমএস বার্তা ($sender)",
                actionTemplateIds = listOf(actionTemplateId),
                signature = "hmac_${hmac}"
            )
        }
    }
}
