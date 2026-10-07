package com.shalik.core.data.model

enum class AlertType {
    HEAT,
    FLOOD,
    CYCLONE,
    HEAVY_RAIN,
    COLD
}

enum class AlertSeverity(val level: Int, val labelBn: String) {
    ADVISORY(1, "সতর্কবার্তা"),
    WATCH(2, "নজরদারি"),
    WARNING(3, "বিপদ সংকেত"),
    EMERGENCY(4, "জরুরি সতর্কবার্তা")
}

data class ShalikAlert(
    val id: String,
    val type: AlertType,
    val severity: AlertSeverity,
    val districtCodes: List<String>,
    val upazilaCodes: List<String> = emptyList(),
    val validFromIso: String,
    val validToIso: String,
    val messageBn: String,
    val messageEn: String? = null,
    val source: String,
    val actionTemplateIds: List<String> = emptyList(),
    val signature: String,
    val isRead: Boolean = false,
    val receivedAt: Long = System.currentTimeMillis()
)
