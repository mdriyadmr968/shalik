package com.shalik.core.data.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.shalik.core.data.database.entity.AlertEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface AlertDao {

    @Query("SELECT * FROM alerts ORDER BY receivedAt DESC")
    fun getAllAlerts(): Flow<List<AlertEntity>>

    @Query("SELECT * FROM alerts WHERE districtCodesCsv LIKE '%' || :districtCode || '%' ORDER BY severityLevel DESC, receivedAt DESC")
    fun getAlertsForDistrict(districtCode: String): Flow<List<AlertEntity>>

    @Query("SELECT * FROM alerts WHERE id = :alertId LIMIT 1")
    suspend fun getAlertById(alertId: String): AlertEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAlert(alert: AlertEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAlerts(alerts: List<AlertEntity>)

    @Query("UPDATE alerts SET isRead = 1 WHERE id = :alertId")
    suspend fun markAsRead(alertId: String)

    @Query("DELETE FROM alerts WHERE validToIso < :currentIsoTimestamp")
    suspend fun deleteExpiredAlerts(currentIsoTimestamp: String)
}
