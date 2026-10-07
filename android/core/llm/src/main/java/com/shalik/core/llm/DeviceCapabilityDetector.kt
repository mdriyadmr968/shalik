package com.shalik.core.llm

import android.app.ActivityManager
import android.content.Context
import android.os.Build
import android.os.Environment
import android.os.StatFs
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

enum class DeviceTier {
    ENTRY_4GB,      // Target: Gemma 3n E2B (int4), 512 context, low-RAM mode
    MID_6GB,        // Target: Gemma 3n E2B (int4), 1024 context (Reference phone)
    HIGH_8GB_PLUS   // Can optionally run E4B or 2048 context
}

data class DeviceSpec(
    val totalRamMb: Long,
    val availableRamMb: Long,
    val freeStorageMb: Long,
    val cpuCores: Int,
    val isArm64: Boolean,
    val recommendedTier: DeviceTier,
    val recommendedModelFileName: String,
    val maxContextTokens: Int,
    val isLowRamModeActive: Boolean,
    val isLowStorageWarning: Boolean
)

@Singleton
class DeviceCapabilityDetector @Inject constructor(
    @ApplicationContext private val context: Context
) {
    fun detectDeviceCapabilities(): DeviceSpec {
        val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val memoryInfo = ActivityManager.MemoryInfo()
        activityManager.getMemoryInfo(memoryInfo)

        val totalRamMb = memoryInfo.totalMem / (1024 * 1024)
        val availableRamMb = memoryInfo.availMem / (1024 * 1024)

        val stat = StatFs(Environment.getDataDirectory().path)
        val freeStorageMb = (stat.availableBlocksLong * stat.blockSizeLong) / (1024 * 1024)

        val cpuCores = Runtime.getRuntime().availableProcessors()
        val isArm64 = Build.SUPPORTED_ABIS.any { it.contains("arm64") }

        val tier = when {
            totalRamMb >= 7500 -> DeviceTier.HIGH_8GB_PLUS
            totalRamMb >= 5200 -> DeviceTier.MID_6GB
            else -> DeviceTier.ENTRY_4GB
        }

        val recommendedModel = when (tier) {
            DeviceTier.HIGH_8GB_PLUS -> "gemma-3n-e4b-it-w4a16.litertlm"
            DeviceTier.MID_6GB, DeviceTier.ENTRY_4GB -> "gemma-3n-e2b-it-w4a16.litertlm"
        }

        val maxContext = when (tier) {
            DeviceTier.HIGH_8GB_PLUS -> 2048
            DeviceTier.MID_6GB -> 1024
            DeviceTier.ENTRY_4GB -> 512
        }

        val isLowRam = tier == DeviceTier.ENTRY_4GB || availableRamMb < 900
        val isLowStorage = freeStorageMb < 1500

        return DeviceSpec(
            totalRamMb = totalRamMb,
            availableRamMb = availableRamMb,
            freeStorageMb = freeStorageMb,
            cpuCores = cpuCores,
            isArm64 = isArm64,
            recommendedTier = tier,
            recommendedModelFileName = recommendedModel,
            maxContextTokens = maxContext,
            isLowRamModeActive = isLowRam,
            isLowStorageWarning = isLowStorage
        )
    }
}
