package com.shalik.core.data.model

enum class MessageSender {
    USER,
    SHALIK
}

data class ChatMessage(
    val id: Long = 0,
    val conversationId: Long,
    val sender: MessageSender,
    val text: String,
    val timestamp: Long = System.currentTimeMillis(),
    val isStreaming: Boolean = false,
    val imageUri: String? = null,
    val citedSources: List<String> = emptyList()
)

data class Conversation(
    val id: Long = 0,
    val title: String,
    val createdAt: Long = System.currentTimeMillis(),
    val lastMessagePreview: String = ""
)
