package com.shalik.core.data.di

import android.content.Context
import androidx.room.Room
import com.shalik.core.data.database.ShalikDatabase
import com.shalik.core.data.database.dao.ChatDao
import com.shalik.core.data.database.dao.FarmerProfileDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DataModule {

    @Provides
    @Singleton
    fun provideShalikDatabase(
        @ApplicationContext context: Context
    ): ShalikDatabase = Room.databaseBuilder(
        context,
        ShalikDatabase::class.java,
        "shalik_database.db"
    ).fallbackToDestructiveMigration().build()

    @Provides
    fun provideChatDao(database: ShalikDatabase): ChatDao = database.chatDao()

    @Provides
    fun provideFarmerProfileDao(database: ShalikDatabase): FarmerProfileDao = database.farmerProfileDao()
}
