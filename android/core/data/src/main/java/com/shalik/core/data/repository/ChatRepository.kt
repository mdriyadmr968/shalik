package com.shalik.core.data.repository

import com.shalik.core.data.database.dao.ChatDao
import com.shalik.core.data.database.entity.ChatMessageEntity
import com.shalik.core.data.database.entity.ConversationEntity
import com.shalik.core.data.model.ChatMessage
import com.shalik.core.data.model.Conversation
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ChatRepository @Inject constructor(
    private val chatDao: ChatDao
) {
    fun getConversations(): Flow<List<Conversation>> =
        chatDao.getAllConversations().map { list -> list.map { it.toDomain() } }

    fun getMessages(conversationId: Long): Flow<List<ChatMessage>> =
        chatDao.getMessagesForConversation(conversationId).map { list -> list.map { it.toDomain() } }

    suspend fun createConversation(title: String): Long =
        chatDao.insertConversation(ConversationEntity(title = title))

    suspend fun updateConversationPreview(conversationId: Long, preview: String) =
        chatDao.updateConversation(ConversationEntity(id = conversationId, title = "পরামর্শ", lastMessagePreview = preview))

    suspend fun saveMessage(message: ChatMessage): Long =
        chatDao.insertMessage(ChatMessageEntity.fromDomain(message))

    suspend fun deleteConversation(id: Long) =
        chatDao.deleteConversation(id)
}
