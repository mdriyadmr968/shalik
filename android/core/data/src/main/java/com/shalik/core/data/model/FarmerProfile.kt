package com.shalik.core.data.model

data class FarmerProfile(
    val id: Int = 1, // Single profile on personal phone
    val farmerName: String = "",
    val district: String = "",
    val upazila: String = "",
    val primaryCrops: List<String> = listOf("ধান"), // Default: Rice
    val isOnboarded: Boolean = false,
    val preferredLanguage: String = "bn"
)
