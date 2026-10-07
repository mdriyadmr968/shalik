package com.shalik.core.data.telemetry

import android.content.Context
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import javax.inject.Inject
import javax.inject.Singleton

data class FieldQueryTelemetry(
    val queryId: String,
    val timestampIso: String,
    val timeToFirstTokenMs: Long,
    val totalGenerationMs: Long,
    val tokensGenerated: Int,
    val peakAppRamMb: Long,
    val asrDurationSeconds: Float = 0f,
    val wasImageIncluded: Boolean = false,
    val didCrashOrError: Boolean = false,
    val farmerRating: Int? = null // 1 to 5, or null
)

@Singleton
class FieldTelemetryLogger @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val telemetryFile by lazy {
        File(context.filesDir, "shalik_field_telemetry.jsonl")
    }

    suspend fun logQueryTelemetry(telemetry: FieldQueryTelemetry) = withContext(Dispatchers.IO) {
        val jsonLine = """{"query_id":"${telemetry.queryId}","timestamp":"${telemetry.timestampIso}","ttft_ms":${telemetry.timeToFirstTokenMs},"total_lat_ms":${telemetry.totalGenerationMs},"tokens":${telemetry.tokensGenerated},"peak_ram_mb":${telemetry.peakAppRamMb},"asr_sec":${telemetry.asrDurationSeconds},"has_img":${telemetry.wasImageIncluded},"error":${telemetry.didCrashOrError},"rating":${telemetry.farmerRating ?: "null"}}"""
        telemetryFile.appendText("$jsonLine\n")
    }

    suspend fun exportTelemetryForFieldResearcher(): String = withContext(Dispatchers.IO) {
        if (!telemetryFile.exists()) return@withContext "[]"
        val lines = telemetryFile.readLines().filter { it.isNotBlank() }
        "[\n" + lines.joinToString(",\n") + "\n]"
    }

    suspend fun clearTelemetry() = withContext(Dispatchers.IO) {
        if (telemetryFile.exists()) {
            telemetryFile.delete()
        }
    }
}
