package com.shalik.core.data.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.shalik.core.data.database.entity.FarmerProfileEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface FarmerProfileDao {
    @Query("SELECT * FROM farmer_profiles WHERE id = 1 LIMIT 1")
    fun getProfile(): Flow<FarmerProfileEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun saveProfile(profile: FarmerProfileEntity)
}
