package com.shalik.feature.assistant.viewmodel

import android.graphics.Bitmap
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.shalik.core.data.model.ChatMessage
import com.shalik.core.data.model.Conversation
import com.shalik.core.data.model.MessageSender
import com.shalik.core.data.repository.ChatRepository
import com.shalik.core.data.repository.FarmerProfileRepository
import com.shalik.core.llm.EngineState
import com.shalik.core.llm.LiteRtLmEngine
import com.shalik.core.llm.ModelManager
import com.shalik.core.llm.ModelState
import com.shalik.feature.assistant.prompt.MultimodalPromptBuilder
import com.shalik.feature.assistant.prompt.PromptContext
import com.shalik.feature.assistant.speech.AsrResult
import com.shalik.feature.assistant.speech.AudioRecorder
import com.shalik.feature.assistant.speech.BanglaTextToSpeech
import com.shalik.feature.assistant.speech.RecordingState
import com.shalik.feature.assistant.speech.SpeechToText
import com.shalik.feature.assistant.speech.TtsState
import com.shalik.feature.assistant.vision.ImageQualityChecker
import com.shalik.feature.assistant.vision.QualityCheckResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.io.File
import javax.inject.Inject

data class AssistantUiState(
    val currentConversationId: Long? = null,
    val messages: List<ChatMessage> = emptyList(),
    val streamingText: String = "",
    val isGenerating: Boolean = false,
    val engineState: EngineState = EngineState.Uninitialized,
    val modelState: ModelState = ModelState.NotInstalled,
    val recordingState: RecordingState = RecordingState.Idle,
    val ttsState: TtsState = TtsState.Idle,
    val pendingVoiceTranscript: String? = null,
    val attachedImageUri: String? = null,
    val imageQualityWarning: String? = null,
    val error: String? = null
)

@HiltViewModel
class AssistantViewModel @Inject constructor(
    private val chatRepository: ChatRepository,
    private val farmerProfileRepository: FarmerProfileRepository,
    private val llmEngine: LiteRtLmEngine,
    private val modelManager: ModelManager,
    private val audioRecorder: AudioRecorder,
    private val speechToText: SpeechToText,
    private val textToSpeech: BanglaTextToSpeech,
    private val promptBuilder: MultimodalPromptBuilder,
    private val imageQualityChecker: ImageQualityChecker
) : ViewModel() {

    private val _uiState = MutableStateFlow(AssistantUiState())
    val uiState: StateFlow<AssistantUiState> = _uiState.asStateFlow()

    val conversations: StateFlow<List<Conversation>> = chatRepository.getConversations()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val farmerProfile = farmerProfileRepository.farmerProfile
        .stateIn(viewModelScope, SharingStarted.Eagerly, null)

    private var generationJob: Job? = null

    init {
        viewModelScope.launch {
            modelManager.modelState.collect { mState ->
                _uiState.value = _uiState.value.copy(modelState = mState)
                if (mState is ModelState.Ready && !llmEngine.isReady()) {
                    llmEngine.initialize()
                }
            }
        }
        viewModelScope.launch {
            llmEngine.engineState.collect { eState ->
                _uiState.value = _uiState.value.copy(engineState = eState)
            }
        }
        viewModelScope.launch {
            audioRecorder.recordingState.collect { rState ->
                _uiState.value = _uiState.value.copy(recordingState = rState)
            }
        }
        viewModelScope.launch {
            textToSpeech.ttsState.collect { tState ->
                _uiState.value = _uiState.value.copy(ttsState = tState)
            }
        }
        startNewConversation()
    }

    fun startNewConversation() {
        generationJob?.cancel()
        textToSpeech.stop()
        viewModelScope.launch {
            val convId = chatRepository.createConversation("নতুন পরামর্শ")
            _uiState.value = _uiState.value.copy(
                currentConversationId = convId,
                messages = emptyList(),
                streamingText = "",
                isGenerating = false,
                attachedImageUri = null,
                pendingVoiceTranscript = null,
                error = null
            )
            observeMessages(convId)
        }
    }

    fun selectConversation(conversationId: Long) {
        generationJob?.cancel()
        textToSpeech.stop()
        _uiState.value = _uiState.value.copy(
            currentConversationId = conversationId,
            streamingText = "",
            isGenerating = false
        )
        observeMessages(conversationId)
    }

    private fun observeMessages(conversationId: Long) {
        viewModelScope.launch {
            chatRepository.getMessages(conversationId).collect { msgs ->
                _uiState.value = _uiState.value.copy(messages = msgs)
            }
        }
    }

    // --- Voice Recording & ASR (M2) ---
    fun startVoiceRecording(outputFile: File) {
        viewModelScope.launch {
            audioRecorder.startRecording(outputFile)
        }
    }

    fun stopVoiceRecordingAndTranscribe(audioFile: File) {
        audioRecorder.stopRecording()
        viewModelScope.launch {
            speechToText.transcribe(audioFile).collect { asrResult ->
                when (asrResult) {
                    is AsrResult.Partial -> {
                        _uiState.value = _uiState.value.copy(pendingVoiceTranscript = asrResult.text)
                    }
                    is AsrResult.Final -> {
                        _uiState.value = _uiState.value.copy(pendingVoiceTranscript = asrResult.text)
                    }
                    is AsrResult.Error -> {
                        _uiState.value = _uiState.value.copy(error = asrResult.message)
                    }
                }
            }
        }
    }

    fun confirmVoiceTranscript(confirmedText: String) {
        _uiState.value = _uiState.value.copy(pendingVoiceTranscript = null)
        sendQuery(confirmedText)
    }

    fun dismissVoiceTranscript() {
        _uiState.value = _uiState.value.copy(pendingVoiceTranscript = null)
    }

    // --- Image Handling (M2) ---
    fun attachImage(imageUri: String, bitmap: Bitmap?) {
        var warning: String? = null
        if (bitmap != null) {
            val check = imageQualityChecker.evaluateImageQuality(bitmap)
            warning = check.warningMessageBn
        }
        _uiState.value = _uiState.value.copy(
            attachedImageUri = imageUri,
            imageQualityWarning = warning
        )
    }

    fun removeAttachedImage() {
        _uiState.value = _uiState.value.copy(
            attachedImageUri = null,
            imageQualityWarning = null
        )
    }

    // --- Audio Playback / TTS (M2) ---
    fun playMessageAudio(text: String) {
        textToSpeech.speak(text)
    }

    fun stopAudio() {
        textToSpeech.stop()
    }

    // --- Query Execution ---
    fun sendQuery(userText: String) {
        val trimmed = userText.trim()
        if (trimmed.isBlank() || _uiState.value.isGenerating) return

        val convId = _uiState.value.currentConversationId ?: return
        val currentImageUri = _uiState.value.attachedImageUri

        generationJob = viewModelScope.launch {
            try {
                // Save user message to database
                val userMsg = ChatMessage(
                    conversationId = convId,
                    sender = MessageSender.USER,
                    text = trimmed,
                    imageUri = currentImageUri
                )
                chatRepository.saveMessage(userMsg)

                _uiState.value = _uiState.value.copy(
                    isGenerating = true,
                    streamingText = "",
                    attachedImageUri = null,
                    imageQualityWarning = null,
                    error = null
                )

                if (!llmEngine.isReady()) {
                    llmEngine.initialize()
                }

                val prompt = promptBuilder.buildPrompt(
                    PromptContext(
                        farmerQuestion = trimmed,
                        cropName = farmerProfile.value?.primaryCrops?.firstOrNull() ?: "ধান",
                        district = farmerProfile.value?.district ?: "",
                        hasImageAttached = currentImageUri != null
                    )
                )

                val fullResponseBuilder = StringBuilder()
                llmEngine.generateStream(prompt).collect { token ->
                    fullResponseBuilder.append(token)
                    _uiState.value = _uiState.value.copy(
                        streamingText = fullResponseBuilder.toString()
                    )
                }

                val finalResponse = fullResponseBuilder.toString()
                val shalikMsg = ChatMessage(
                    conversationId = convId,
                    sender = MessageSender.SHALIK,
                    text = finalResponse
                )
                chatRepository.saveMessage(shalikMsg)
                chatRepository.updateConversationPreview(convId, trimmed)

                _uiState.value = _uiState.value.copy(
                    isGenerating = false,
                    streamingText = ""
                )

                // Auto-read aloud in Bangla for farmer accessibility
                textToSpeech.speak(finalResponse)
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isGenerating = false,
                    error = "ত্রুটি: ${e.localizedMessage ?: "অজ্ঞাত সমস্যা"}"
                )
            }
        }
    }

    fun cancelGeneration() {
        generationJob?.cancel()
        textToSpeech.stop()
        _uiState.value = _uiState.value.copy(isGenerating = false)
    }

    override fun onCleared() {
        super.onCleared()
        textToSpeech.shutdown()
    }
}
