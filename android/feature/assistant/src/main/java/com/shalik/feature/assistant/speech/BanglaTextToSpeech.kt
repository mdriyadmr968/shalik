package com.shalik.feature.assistant.speech

import android.content.Context
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.Locale
import javax.inject.Inject
import javax.inject.Singleton

sealed interface TtsState {
    data object Idle : TtsState
    data object Initializing : TtsState
    data object Ready : TtsState
    data object Speaking : TtsState
    data object VoiceDataMissing : TtsState
    data class Error(val message: String) : TtsState
}

@Singleton
class BanglaTextToSpeech @Inject constructor(
    @ApplicationContext private val context: Context
) : TextToSpeech.OnInitListener {

    private val _ttsState = MutableStateFlow<TtsState>(TtsState.Initializing)
    val ttsState: StateFlow<TtsState> = _ttsState.asStateFlow()

    private var tts: TextToSpeech? = null
    private var isLanguageAvailable = false

    init {
        tts = TextToSpeech(context, this)
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            val bangladeshLocale = Locale("bn", "BD")
            val indiaLocale = Locale("bn", "IN")

            val resultBD = tts?.isLanguageAvailable(bangladeshLocale)
            val resultIN = tts?.isLanguageAvailable(indiaLocale)

            val chosenLocale = when {
                resultBD == TextToSpeech.LANG_AVAILABLE || resultBD == TextToSpeech.LANG_COUNTRY_AVAILABLE -> bangladeshLocale
                resultIN == TextToSpeech.LANG_AVAILABLE || resultIN == TextToSpeech.LANG_COUNTRY_AVAILABLE -> indiaLocale
                else -> null
            }

            if (chosenLocale != null) {
                tts?.language = chosenLocale
                tts?.setSpeechRate(0.85f) // Slightly slower for clear rural comprehension
                tts?.setPitch(1.0f)
                isLanguageAvailable = true
                _ttsState.value = TtsState.Ready

                tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                    override fun onStart(utteranceId: String?) {
                        _ttsState.value = TtsState.Speaking
                    }

                    override fun onDone(utteranceId: String?) {
                        _ttsState.value = TtsState.Idle
                    }

                    @Deprecated("Deprecated in Java")
                    override fun onError(utteranceId: String?) {
                        _ttsState.value = TtsState.Error("কথা বলতে ত্রুটি হয়েছে")
                    }
                })
            } else {
                isLanguageAvailable = false
                _ttsState.value = TtsState.VoiceDataMissing
            }
        } else {
            _ttsState.value = TtsState.Error("টিটিএস ইঞ্জিন চালু করা যায়নি")
        }
    }

    fun speak(text: String) {
        if (!isLanguageAvailable || tts == null) {
            _ttsState.value = TtsState.VoiceDataMissing
            return
        }

        // Clean text (remove emoji, markdown asterisks, source IDs) for natural speech
        val cleanSpeechText = cleanTextForSpeech(text)
        val params = HashMap<String, String>()
        params[TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID] = "shalik_utterance_${System.currentTimeMillis()}"

        tts?.speak(cleanSpeechText, TextToSpeech.QUEUE_FLUSH, null, params[TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID])
    }

    fun stop() {
        tts?.stop()
        _ttsState.value = TtsState.Idle
    }

    fun shutdown() {
        tts?.stop()
        tts?.shutdown()
        tts = null
    }

    private fun cleanTextForSpeech(input: String): String {
        return input
            .replace(Regex("[*#_`~]"), "")
            .replace(Regex("[🌱⚠️✍️🌾🔴🟢]"), "")
            .replace(Regex("সূত্র:[^\\n]+"), "")
            .trim()
    }
}
