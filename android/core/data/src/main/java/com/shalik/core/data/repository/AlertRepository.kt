package com.shalik.core.data.repository

import com.shalik.core.data.database.dao.AlertDao
import com.shalik.core.data.database.entity.AlertEntity
import com.shalik.core.data.model.ShalikAlert
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AlertRepository @Inject constructor(
    private val alertDao: AlertDao
) {

    fun getAllAlerts(): Flow<List<ShalikAlert>> =
        alertDao.getAllAlerts().map { list -> list.map { it.toDomain() } }

    fun getAlertsForDistrict(districtCode: String): Flow<List<ShalikAlert>> =
        alertDao.getAlertsForDistrict(districtCode).map { list -> list.map { it.toDomain() } }

    suspend fun getAlertById(alertId: String): ShalikAlert? =
        alertDao.getAlertById(alertId)?.toDomain()

    suspend fun saveAlert(alert: ShalikAlert) {
        alertDao.insertAlert(AlertEntity.fromDomain(alert))
    }

    suspend fun saveAlerts(alerts: List<ShalikAlert>) {
        alertDao.insertAlerts(alerts.map { AlertEntity.fromDomain(it) })
    }

    suspend fun markAsRead(alertId: String) {
        alertDao.markAsRead(alertId)
    }

    suspend fun deleteExpiredAlerts(currentIsoTimestamp: String) {
        alertDao.deleteExpiredAlerts(currentIsoTimestamp)
    }
}
