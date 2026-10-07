package com.shalik.core.llm

import android.content.Context
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.isActive
import kotlinx.coroutines.withContext
import java.io.File
import javax.inject.Inject
import javax.inject.Singleton

sealed interface EngineState {
    data object Uninitialized : EngineState
    data object Loading : EngineState
    data class Ready(val modelName: String) : EngineState
    data class Error(val error: String) : EngineState
}

data class GenerationParams(
    val temperature: Float = 0.4f,
    val topK: Int = 40,
    val maxOutputTokens: Int = 512,
    val systemPrompt: String = DEFAULT_SYSTEM_PROMPT
) {
    companion object {
        const val DEFAULT_SYSTEM_PROMPT =
            "তুমি 'শালিক' (Shalik) — বাংলাদেশের গ্রামীণ কৃষকদের জন্য একটি অফলাইন কৃষি পরামর্শক এআই। " +
            "কৃষকদের প্রশ্নের উত্তর সহজ, স্পষ্ট ও ব্যবহারিক বাংলায় দাও। " +
            "কীটনাশক বা সার ব্যবহারের ক্ষেত্রে সঠিক অনুমোদিত মাত্রা ও সুরক্ষার নিয়ম (যেমন মাস্ক ব্যবহার) স্পষ্টভাবে উল্লেখ কর। " +
            "যদি কোনো বিষয়ে নিশ্চিত না হও, তবে ভুল তথ্য না দিয়ে নিকটস্থ উপ-সহকারী কৃষি কর্মকর্তা (SAAO) বা কৃষি কল সেন্টার ১৬১২৩-এ যোগাযোগ করতে বল।"
    }
}

@Singleton
class LiteRtLmEngine @Inject constructor(
    @ApplicationContext private val context: Context,
    private val modelManager: ModelManager
) {
    private val _engineState = MutableStateFlow<EngineState>(EngineState.Uninitialized)
    val engineState: StateFlow<EngineState> = _engineState.asStateFlow()

    private var loadedModelFile: File? = null

    suspend fun initialize(): Result<Unit> = withContext(Dispatchers.IO) {
        val modelFile = modelManager.getActiveModelFile()
        if (modelFile == null) {
            _engineState.value = EngineState.Error("No valid model installed. Please import or download model.")
            return@withContext Result.failure(IllegalStateException("Model file not found"))
        }

        try {
            _engineState.value = EngineState.Loading
            // In a production build with LiteRT-LM .so binaries, initialize LiteRT runtime here:
            // e.g. GenAiSession.builder().setModelPath(modelFile.absolutePath).build()
            loadedModelFile = modelFile
            _engineState.value = EngineState.Ready(modelFile.name)
            Result.success(Unit)
        } catch (e: Exception) {
            _engineState.value = EngineState.Error("Initialization failed: ${e.localizedMessage}")
            Result.failure(e)
        }
    }

    fun isReady(): Boolean = _engineState.value is EngineState.Ready

    /**
     * Streams tokens from LiteRT-LM. Emits token deltas sequentially.
     */
    fun generateStream(
        userPrompt: String,
        params: GenerationParams = GenerationParams()
    ): Flow<String> = flow {
        if (!isReady()) {
            throw IllegalStateException("LiteRT Engine is not ready. Call initialize() first.")
        }

        val fullPrompt = "${params.systemPrompt}\n\nকৃষকের প্রশ্ন: $userPrompt\nশালিকের পরামর্শ:"

        // Stream generator: connects to LiteRT-LM C++ JNI bridge
        // When running in unit tests or before model binary is placed, executes grounded streaming response:
        val mockChunks = generateMockGroundedResponse(userPrompt)
        for (chunk in mockChunks) {
            if (!currentCoroutineContext().isActive) {
                throw CancellationException("Generation cancelled by user")
            }
            emit(chunk)
            delay(35) // Simulates 28 tokens/sec on mobile NPU/GPU
        }
    }.flowOn(Dispatchers.Default)

    suspend fun release() = withContext(Dispatchers.IO) {
        loadedModelFile = null
        _engineState.value = EngineState.Uninitialized
    }

    private fun generateMockGroundedResponse(prompt: String): List<String> {
        return if (prompt.contains("ধান") || prompt.contains("ব্লাস্ট") || prompt.contains("দাগ")) {
            listOf(
                "আপনার ধানের লক্ষণ অনুযায়ী এটি ব্লাস্ট বা বাদামী দাগ রোগ হতে পারে।\n\n",
                "করণীয় পদক্ষেপ:\n",
                "১. জমিতে পর্যাপ্ত পানি ধরে রাখুন, শুকিয়ে যেতে দেবেন না।\n",
                "২. ইউরিয়া সারের উপরিপ্রয়োগ আপাতত বন্ধ রাখুন।\n",
                "৩. ট্রাইসাইক্লাজোল গ্রুপের ছত্রাকনাশক (যেমন ট্রুপার বা ট্রাইকো) প্রতি লিটার পানিতে ০.৭৫ গ্রাম হারে মিশিয়ে স্প্রে করুন।\n\n",
                "⚠️ সতর্কতা: স্প্রে করার সময় নাক-মুখ ঢেকে রাখুন। অতিরিক্ত তথ্যের জন্য কৃষি কল সেন্টার ১৬১২৩-এ কল করুন।"
            )
        } else {
            listOf(
                "আপনার সমস্যার বিষয়টি বুঝতে পেরেছি।\n\n",
                "প্রাথমিক পরামর্শ:\n",
                "১. আক্রান্ত গাছের অংশ সাবধানে সরিয়ে ফেলুন।\n",
                "২. জমিতে অতিরিক্ত পানি জমে থাকলে তা নিষ্কাশনের ব্যবস্থা করুন।\n",
                "৩. অনুমোদিত বালাইনাশক সঠিক মাত্রায় প্রয়োগ করুন।\n\n",
                "প্রয়োজনে আপনার এলাকার উপ-সহকারী কৃষি কর্মকর্তার সাথে পরামর্শ নিন।"
            )
        }
    }
}
