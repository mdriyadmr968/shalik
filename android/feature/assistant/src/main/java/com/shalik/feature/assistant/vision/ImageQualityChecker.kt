package com.shalik.feature.assistant.vision

import android.graphics.Bitmap
import android.graphics.Color
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.math.abs

data class QualityCheckResult(
    val isGoodQuality: Boolean,
    val averageLuminance: Float,
    val isTooDark: Boolean,
    val isTooBright: Boolean,
    val warningMessageBn: String?
)

@Singleton
class ImageQualityChecker @Inject constructor() {

    fun evaluateImageQuality(bitmap: Bitmap): QualityCheckResult {
        val width = bitmap.width
        val height = bitmap.height

        // Downsample pixels to compute average luminance quickly
        val sampleStep = 8
        var totalLuminance = 0.0
        var pixelCount = 0

        for (x in 0 until width step sampleStep) {
            for (y in 0 until height step sampleStep) {
                val pixel = bitmap.getPixel(x, y)
                val r = Color.red(pixel)
                val g = Color.green(pixel)
                val b = Color.blue(pixel)
                // Standard perceived luminance formula
                val lum = 0.299 * r + 0.587 * g + 0.114 * b
                totalLuminance += lum
                pixelCount++
            }
        }

        val avgLuminance = (totalLuminance / pixelCount.coerceAtLeast(1)).toFloat()
        val isTooDark = avgLuminance < 40.0f
        val isTooBright = avgLuminance > 225.0f

        val warning = when {
            isTooDark -> "ছবিটি বেশি অন্ধকার। দিনের আলোয় বা ফ্ল্যাশ দিয়ে ছবি তুলুন।"
            isTooBright -> "ছবিতে অতিরিক্ত রোদ বা আলো পড়েছে। ছায়ায় ধরে ছবি তুলুন।"
            else -> null
        }

        return QualityCheckResult(
            isGoodQuality = !isTooDark && !isTooBright,
            averageLuminance = avgLuminance,
            isTooDark = isTooDark,
            isTooBright = isTooBright,
            warningMessageBn = warning
        )
    }
}
