package com.shalik.feature.assistant.util

object BanglaFormatters {
    private val englishToBanglaDigits = mapOf(
        '0' to '০', '1' to '১', '2' to '২', '3' to '৩', '4' to '৪',
        '5' to '৫', '6' to '৬', '7' to '৭', '8' to '৮', '9' to '৯'
    )

    fun toBanglaDigits(input: String): String {
        return input.map { char -> englishToBanglaDigits[char] ?: char }.joinToString("")
    }

    fun toBanglaDigits(number: Long): String = toBanglaDigits(number.toString())
    fun toBanglaDigits(number: Int): String = toBanglaDigits(number.toString())
}
