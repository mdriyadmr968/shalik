package com.shalik.core.data.repository

import com.shalik.core.data.database.dao.FarmerProfileDao
import com.shalik.core.data.database.entity.FarmerProfileEntity
import com.shalik.core.data.model.FarmerProfile
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class FarmerProfileRepository @Inject constructor(
    private val profileDao: FarmerProfileDao
) {
    val farmerProfile: Flow<FarmerProfile> =
        profileDao.getProfile().map { it?.toDomain() ?: FarmerProfile() }

    suspend fun saveProfile(profile: FarmerProfile) {
        profileDao.saveProfile(FarmerProfileEntity.fromDomain(profile))
    }
}
