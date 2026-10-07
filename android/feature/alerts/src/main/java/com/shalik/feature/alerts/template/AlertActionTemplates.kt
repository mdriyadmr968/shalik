package com.shalik.feature.alerts.template

import com.shalik.core.data.model.AlertType

data class ActionTemplate(
    val templateId: String,
    val alertType: AlertType,
    val targetCrop: String,
    val growthStage: String,
    val titleBn: String,
    val actionStepsBn: List<String>,
    val urgencyNoteBn: String
)

object AlertActionTemplates {

    private val templates = listOf(
        ActionTemplate(
            templateId = "act_flood_rice_mature",
            alertType = AlertType.FLOOD,
            targetCrop = "ধান",
            growthStage = "পাকা পর্যায় (৮০% পরিপক্ব)",
            titleBn = "বন্যা পূর্ববর্তী পাকা ধান দ্রুত কর্তন ও সংরক্ষণ",
            actionStepsBn = listOf(
                "জমির ধান ৮০ ভাগ পেকে গেলেই কালবিলম্ব না করে দ্রুত কেটে ফেলুন।",
                "কাটা ধান উঁচু স্থানে বা পাকা রাস্তায় এনে দ্রুত মাড়াই ও শুকাতে দিন।",
                "বীজ ধান শুকনো পলিথিন বা বায়ুরোধী ড্রামে সিল করে মাচার উপর সংরক্ষণ করুন।",
                "রাসায়নিক সার ও কীটনাশক মাটির সংস্পর্শ থেকে উঁচু মাচায় তুলে রাখুন।"
            ),
            urgencyNoteBn = "জরুরি: পানি বৃদ্ধির পূর্বাভাসে নিম্নাঞ্চল প্লাবিত হওয়ার আগেই কর্তন শেষ করুন।"
        ),
        ActionTemplate(
            templateId = "act_heat_rice_flowering",
            alertType = AlertType.HEAT,
            targetCrop = "ধান",
            growthStage = "ফুল ফোটা ও থোর পর্যায়",
            titleBn = "তীব্র তাপপ্রবাহে ধানের চিটা রোধে সেচ ব্যবস্থাপনা",
            actionStepsBn = listOf(
                "জমিতে সার্বক্ষণিক ৫ থেকে ৭ সেন্টিমিটার (ছিপছিপে) পানি ধরে রাখুন।",
                "সকাল ১০টা থেকে বিকাল ৩টার প্রখর রোদে জমিতে কোনো ধরনের কীটনাশক বা সার স্প্রে করবেন না।",
                "প্রয়োজনে পড়ন্ত বিকেলে বা ভোরে সেচ দিন যাতে মাটির তাপমাত্রা সহনশীল থাকে।",
                "বোরো ধানে পটাশ সারের হালকা স্প্রে (প্রতি লিটারে ১০ গ্রাম এমওপি) তাপ সহনশীলতা বাড়ায়।"
            ),
            urgencyNoteBn = "সতর্কতা: তাপমাত্রা ৩৫° সেলসিয়াস অতিক্রম করলে ফুল পরাগায়ন ব্যাহত হয়ে চিটা হতে পারে।"
        ),
        ActionTemplate(
            templateId = "act_heavy_rain_drainage",
            alertType = AlertType.HEAVY_RAIN,
            targetCrop = "সবজি ও আলু",
            growthStage = "সকল বৃদ্ধি পর্যায়",
            titleBn = "ভারী বৃষ্টিতে জলাবদ্ধতা নিরসন ও নালা সংস্কার",
            actionStepsBn = listOf(
                "জমির চারপাশের নিষ্কাশন নালাগুলো এখনই পরিষ্কার ও গভীর করুন যাতে পানি আটকে না থাকে।",
                "আলু ও শাকসবজির জমিতে পানি জমতে দেওয়া যাবে না, জমলে পচন রোগ দ্রুত ছড়িয়ে পড়ে।",
                "বৃষ্টির আগে কোনো ধরনের স্প্রে বা উপরি-প্রয়োগ সার দেবেন না, ধুয়ে অপচয় হবে।"
            ),
            urgencyNoteBn = "দ্রুত নালা কেটে জমে থাকা পানি পাশের খালে নামিয়ে দিন।"
        ),
        ActionTemplate(
            templateId = "act_cyclone_harvest",
            alertType = AlertType.CYCLONE,
            targetCrop = "সকল ফসল",
            growthStage = "পরিপক্ব পর্যায়",
            titleBn = "ঘূর্ণিঝড় পূর্ববর্তী ফসল ও খামার সুরক্ষা",
            actionStepsBn = listOf(
                "মাঠের সকল পরিপক্ব ফসল ও ফলমূল অনতিবিলম্বে সংগ্রহ করে নিরাপদ স্থানে আনুন।",
                "কলা বাগান, পেঁপে গাছ বা বেড়া দেওয়া ফসলে শক্ত বাঁশের খুঁটি দিয়ে বেঁধে দিন।",
                "গবাদি পশু ও হাঁস-মুরগি নিকটস্থ সাইক্লোন শেল্টারে বা উঁচু পাকা ভিটায় স্থানান্তর করুন।"
            ),
            urgencyNoteBn = "বাতাস তীব্র হওয়ার আগেই মাঠের কাজ গুটিয়ে নিরাপদ আশ্রয়ে যান।"
        ),
        ActionTemplate(
            templateId = "act_cold_potato_blight",
            alertType = AlertType.COLD,
            targetCrop = "আলু",
            growthStage = "কন্দ গঠন পর্যায়",
            titleBn = "ঘন কুয়াশা ও শৈত্যপ্রবাহে আলুর নাবি ধসা প্রতিরোধ",
            actionStepsBn = listOf(
                "টানা ঘন কুয়াশা ও মেঘলা আবহাওয়ায় জমিতে সেচ দেওয়া সাময়িক বন্ধ রাখুন।",
                "লক্ষণ প্রকাশের আগেই সতর্কতামূলক মেনকোজেব গ্রুপের ছত্রাকনাশক (যেমন ডাইথেন এম-৪৫ প্রতি লিটারে ২ গ্রাম) কুয়াশা কাটার পর স্প্রে করুন।",
                "আক্রান্ত গাছ দেখা মাত্রই উপড়ে ফেলে মাটির নিচে পুঁতে ফেলুন।"
            ),
            urgencyNoteBn = "কুয়াশা ভেজা পাতায় ছত্রাক দ্রুত ছড়ায়, পাতা শুকনা অবস্থায় স্প্রে করুন।"
        )
    )

    fun getTemplatesForAlert(alertType: AlertType, crop: String = "ধান"): List<ActionTemplate> {
        return templates.filter { it.alertType == alertType && (it.targetCrop.contains(crop) || it.targetCrop == "সকল ফসল") }
            .ifEmpty {
                templates.filter { it.alertType == alertType }
            }
    }

    fun getTemplateById(id: String): ActionTemplate? {
        return templates.firstOrNull { it.templateId == id }
    }
}
