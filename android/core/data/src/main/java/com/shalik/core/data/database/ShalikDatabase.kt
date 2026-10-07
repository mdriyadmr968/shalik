package com.shalik.core.data.database

import androidx.room.Database
import androidx.room.RoomDatabase
import com.shalik.core.data.database.dao.AlertDao
import com.shalik.core.data.database.dao.ChatDao
import com.shalik.core.data.database.dao.FarmerProfileDao
import com.shalik.core.data.database.entity.AlertEntity
import com.shalik.core.data.database.entity.ChatMessageEntity
import com.shalik.core.data.database.entity.ConversationEntity
import com.shalik.core.data.database.entity.FarmerProfileEntity

@Database(
    entities = [
        ConversationEntity::class,
        ChatMessageEntity::class,
        FarmerProfileEntity::class,
        AlertEntity::class
    ],
    version = 2,
    exportSchema = false
)
abstract class ShalikDatabase : RoomDatabase() {
    abstract fun chatDao(): ChatDao
    abstract fun farmerProfileDao(): FarmerProfileDao
    abstract fun alertDao(): AlertDao
}
