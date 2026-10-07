package com.shalik.feature.assistant.speech

import kotlinx.coroutines.flow.Flow
import java.io.File

sealed interface AsrResult {
    data class Partial(val text: String) : AsrResult
    data class Final(val text: String, val confidence: Float) : AsrResult
    data class Error(val message: String) : AsrResult
}

interface SpeechToText {
    val engineName: String
    fun isAvailable(): Boolean
    suspend fun transcribe(audioFile: File): Flow<AsrResult>
}
