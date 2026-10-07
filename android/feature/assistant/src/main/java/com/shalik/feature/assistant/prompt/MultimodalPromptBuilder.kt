package com.shalik.feature.assistant.prompt

import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import javax.inject.Inject
import javax.inject.Singleton

data class PromptContext(
    val farmerQuestion: String,
    val cropName: String = "ধান",
    val district: String = "",
    val hasImageAttached: Boolean = false,
    val classifierTopLabel: String? = null,
    val classifierConfidence: Float? = null,
    val activeWeatherAlert: String? = null
)

@Singleton
class MultimodalPromptBuilder @Inject constructor() {

    fun buildPrompt(context: PromptContext): String {
        val sb = StringBuilder()

        val season = determineCurrentBanglaSeason()
        sb.append("বর্তমান প্রেক্ষাপট: ঋতু - $season, ফসল - ${context.cropName}")
        if (context.district.isNotBlank()) {
            sb.append(", জেলা - ${context.district}")
        }
        sb.append("\n")

        if (context.activeWeatherAlert != null) {
            sb.append("⚠️ সক্রিয় দুর্যোগ সতর্কতা: ${context.activeWeatherAlert}\n")
        }

        if (context.hasImageAttached && context.classifierTopLabel != null) {
            val confPct = ((context.classifierConfidence ?: 0.9f) * 100).toInt()
            sb.append("পাতার ছবির লক্ষণ শনাক্তকরণ: ${context.classifierTopLabel} (সম্ভাব্যতা $confPct%)\n")
        }

        sb.append("\nকৃষকের প্রশ্ন: ${context.farmerQuestion}")
        return sb.toString()
    }

    private fun determineCurrentBanglaSeason(): String {
        val month = SimpleDateFormat("MM", Locale.US).format(Date()).toInt()
        return when (month) {
            4, 5 -> "গ্রীষ্মকাল (বোরো কর্তন ও আউশ আবাদ)"
            6, 7 -> "বর্ষাকাল (রোপা আমন বীজতলা ও রোপণ)"
            8, 9 -> "শরৎকাল (আমন ফসলের পরিচর্যা)"
            10, 11 -> "হেমন্তকাল (আমন ধান কর্তন ও রবি ফসল সূচনা)"
            12, 1 -> "শীতকাল (বোরো ধানের বীজতলা ও রবি শাকসবজি)"
            2, 3 -> "বসন্তকাল (বোরো ফসলের বৃদ্ধি ও সেচ)"
            else -> "চলতি মৌসুম"
        }
    }
}
