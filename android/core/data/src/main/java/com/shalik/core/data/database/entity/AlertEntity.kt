package com.shalik.core.data.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.shalik.core.data.model.AlertSeverity
import com.shalik.core.data.model.AlertType
import com.shalik.core.data.model.ShalikAlert

@Entity(tableName = "alerts")
data class AlertEntity(
    @PrimaryKey val id: String,
    val type: String,
    val severityLevel: Int,
    val districtCodesCsv: String,
    val upazilaCodesCsv: String,
    val validFromIso: String,
    val validToIso: String,
    val messageBn: String,
    val messageEn: String?,
    val source: String,
    val actionTemplatesCsv: String,
    val signature: String,
    val receivedAt: Long = System.currentTimeMillis(),
    val isRead: Boolean = false
) {
    fun toDomain(): ShalikAlert = ShalikAlert(
        id = id,
        type = try { AlertType.valueOf(type) } catch (e: Exception) { AlertType.HEAVY_RAIN },
        severity = AlertSeverity.entries.firstOrNull { it.level == severityLevel } ?: AlertSeverity.ADVISORY,
        districtCodes = if (districtCodesCsv.isBlank()) emptyList() else districtCodesCsv.split(","),
        upazilaCodes = if (upazilaCodesCsv.isBlank()) emptyList() else upazilaCodesCsv.split(","),
        validFromIso = validFromIso,
        validToIso = validToIso,
        messageBn = messageBn,
        messageEn = messageEn,
        source = source,
        actionTemplateIds = if (actionTemplatesCsv.isBlank()) emptyList() else actionTemplatesCsv.split(","),
        signature = signature,
        isRead = isRead,
        receivedAt = receivedAt
    )

    companion object {
        fun fromDomain(alert: ShalikAlert): AlertEntity = AlertEntity(
            id = alert.id,
            type = alert.type.name,
            severityLevel = alert.severity.level,
            districtCodesCsv = alert.districtCodes.joinToString(","),
            upazilaCodesCsv = alert.upazilaCodes.joinToString(","),
            validFromIso = alert.validFromIso,
            validToIso = alert.validToIso,
            messageBn = alert.messageBn,
            messageEn = alert.messageEn,
            source = alert.source,
            actionTemplatesCsv = alert.actionTemplateIds.joinToString(","),
            signature = alert.signature,
            receivedAt = alert.receivedAt,
            isRead = alert.isRead
        )
    }
}
