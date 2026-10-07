package com.shalik.feature.assistant.viewmodel

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
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

data class AssistantUiState(
    val currentConversationId: Long? = null,
    val messages: List<ChatMessage> = emptyList(),
    val streamingText: String = "",
    val isGenerating: Boolean = false,
    val engineState: EngineState = EngineState.Uninitialized,
    val modelState: ModelState = ModelState.NotInstalled,
    val error: String? = null
)

@HiltViewModel
class AssistantViewModel @Inject constructor(
    private val chatRepository: ChatRepository,
    private val farmerProfileRepository: FarmerProfileRepository,
    private val llmEngine: LiteRtLmEngine,
    private val modelManager: ModelManager
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
        startNewConversation()
    }

    fun startNewConversation() {
        generationJob?.cancel()
        viewModelScope.launch {
            val convId = chatRepository.createConversation("নতুন পরামর্শ")
            _uiState.value = _uiState.value.copy(
                currentConversationId = convId,
                messages = emptyList(),
                streamingText = "",
                isGenerating = false,
                error = null
            )
            observeMessages(convId)
        }
    }

    fun selectConversation(conversationId: Long) {
        generationJob?.cancel()
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

    fun sendTextQuery(query: String) {
        val trimmed = query.trim()
        if (trimmed.isBlank() || _uiState.value.isGenerating) return

        val convId = _uiState.value.currentConversationId ?: return

        generationJob = viewModelScope.launch {
            try {
                // Save user message to database
                val userMsg = ChatMessage(
                    conversationId = convId,
                    sender = MessageSender.USER,
                    text = trimmed
                )
                chatRepository.saveMessage(userMsg)

                _uiState.value = _uiState.value.copy(
                    isGenerating = true,
                    streamingText = "",
                    error = null
                )

                // Initialize engine if not ready
                if (!llmEngine.isReady()) {
                    llmEngine.initialize()
                }

                val fullResponseBuilder = StringBuilder()
                llmEngine.generateStream(trimmed).collect { token ->
                    fullResponseBuilder.append(token)
                    _uiState.value = _uiState.value.copy(
                        streamingText = fullResponseBuilder.toString()
                    )
                }

                // Save completed Shalik message to database
                val shalikMsg = ChatMessage(
                    conversationId = convId,
                    sender = MessageSender.SHALIK,
                    text = fullResponseBuilder.toString()
                )
                chatRepository.saveMessage(shalikMsg)
                chatRepository.updateConversationPreview(convId, trimmed)

                _uiState.value = _uiState.value.copy(
                    isGenerating = false,
                    streamingText = ""
                )
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
        _uiState.value = _uiState.value.copy(isGenerating = false)
    }
}
