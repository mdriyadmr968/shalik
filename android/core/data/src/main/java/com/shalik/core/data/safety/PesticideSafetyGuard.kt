package com.shalik.core.data.safety

import javax.inject.Inject
import javax.inject.Singleton

data class SafetyCheckResult(
    val isApproved: Boolean,
    val sanitizedResponse: String,
    val detectedViolations: List<String>,
    val requiresHelplineEscalation: Boolean
)

@Singleton
class PesticideSafetyGuard @Inject constructor() {

    private val bannedPesticidesBn = listOf(
        "প্যারা কোয়াট", "প্যারা কোয়াট", "paraquat",
        "এনডোসালফান", "endosulfan",
        "কার্বোফিউরান", "carbofuran",
        "মনোক্রোটোফস", "monocrotophos",
        "ডিডিটি", "ddt"
    )

    fun validateAndSanitize(response: String, modelConfidence: Float = 0.9f): SafetyCheckResult {
        val violations = mutableListOf<String>()

        for (banned in bannedPesticidesBn) {
            if (response.contains(banned, ignoreCase = true)) {
                violations.add("নিষিদ্ধ বালাইনাশক সনাক্ত হয়েছে: $banned")
            }
        }

        // Confidence policy: if model is ambiguous / unconfident (< 0.45)
        val lowConfidence = modelConfidence < 0.45f

        val sanitized = if (violations.isNotEmpty()) {
            "⚠️ সতর্কবার্তা: আপনার উল্লেখিত প্রতিকারে সরকারিভাবে নিষিদ্ধ বালাইনাশকের নাম পাওয়া গেছে। " +
            "দয়া করে পরিবেশ ও মানবদেহের জন্য ঝুঁকিপূর্ণ নিষিদ্ধ বিষ প্রয়োগ করবেন না। " +
            "অনুমোদিত নিরাপদ বালাইনাশকের সঠিক তালিকার জন্য আপনার এলাকার উপ-সহকারী কৃষি কর্মকর্তা (SAAO) বা কৃষি কল সেন্টার ১৬১২৩-এ যোগাযোগ করুন।"
        } else if (lowConfidence) {
            "$response\n\n⚠️ শালিকের পরামর্শ: লক্ষণটি কিছুটা অস্পষ্ট হওয়ায় পূর্ণ নিশ্চিত হওয়া যায়নি। " +
            "ভুল প্রয়োগ এড়াতে অনুগ্রহ করে কৃষি কল সেন্টার ১৬১২৩-এ কল করে কৃষি বিশেষজ্ঞের সাথে কথা বলুন।"
        } else {
            response
        }

        return SafetyCheckResult(
            isApproved = violations.isEmpty(),
            sanitizedResponse = sanitized,
            detectedViolations = violations,
            requiresHelplineEscalation = lowConfidence || violations.isNotEmpty()
        )
    }
}
