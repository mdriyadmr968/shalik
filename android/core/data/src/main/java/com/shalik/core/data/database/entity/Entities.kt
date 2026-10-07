package com.shalik.core.data.database.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey
import com.shalik.core.data.model.ChatMessage
import com.shalik.core.data.model.Conversation
import com.shalik.core.data.model.FarmerProfile
import com.shalik.core.data.model.MessageSender

@Entity(tableName = "conversations")
data class ConversationEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val createdAt: Long = System.currentTimeMillis(),
    val lastMessagePreview: String = ""
) {
    fun toDomain(): Conversation = Conversation(
        id = id,
        title = title,
        createdAt = createdAt,
        lastMessagePreview = lastMessagePreview
    )
}

@Entity(
    tableName = "chat_messages",
    foreignKeys = [
        ForeignKey(
            entity = ConversationEntity::class,
            parentColumns = ["id"],
            childColumns = ["conversationId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("conversationId")]
)
data class ChatMessageEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val conversationId: Long,
    val sender: String, // "USER" or "SHALIK"
    val text: String,
    val timestamp: Long = System.currentTimeMillis(),
    val imageUri: String? = null,
    val citedSourcesCsv: String = ""
) {
    fun toDomain(): ChatMessage = ChatMessage(
        id = id,
        conversationId = conversationId,
        sender = if (sender == "USER") MessageSender.USER else MessageSender.SHALIK,
        text = text,
        timestamp = timestamp,
        isStreaming = false,
        imageUri = imageUri,
        citedSources = if (citedSourcesCsv.isBlank()) emptyList() else citedSourcesCsv.split("|||")
    )

    companion object {
        fun fromDomain(msg: ChatMessage): ChatMessageEntity = ChatMessageEntity(
            id = msg.id,
            conversationId = msg.conversationId,
            sender = msg.sender.name,
            text = msg.text,
            timestamp = msg.timestamp,
            imageUri = msg.imageUri,
            citedSourcesCsv = msg.citedSources.joinToString("|||")
        )
    }
}

@Entity(tableName = "farmer_profiles")
data class FarmerProfileEntity(
    @PrimaryKey val id: Int = 1,
    val farmerName: String,
    val district: String,
    val upazila: String,
    val primaryCropsCsv: String,
    val isOnboarded: Boolean,
    val preferredLanguage: String
) {
    fun toDomain(): FarmerProfile = FarmerProfile(
        id = id,
        farmerName = farmerName,
        district = district,
        upazila = upazila,
        primaryCrops = if (primaryCropsCsv.isBlank()) emptyList() else primaryCropsCsv.split(","),
        isOnboarded = isOnboarded,
        preferredLanguage = preferredLanguage
    )

    companion object {
        fun fromDomain(profile: FarmerProfile): FarmerProfileEntity = FarmerProfileEntity(
            id = profile.id,
            farmerName = profile.farmerName,
            district = profile.district,
            upazila = profile.upazila,
            primaryCropsCsv = profile.primaryCrops.joinToString(","),
            isOnboarded = profile.isOnboarded,
            preferredLanguage = profile.preferredLanguage
        )
    }
}
