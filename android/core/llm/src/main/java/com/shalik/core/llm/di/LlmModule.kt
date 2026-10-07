package com.shalik.core.llm.di

import android.content.Context
import com.shalik.core.llm.DeviceCapabilityDetector
import com.shalik.core.llm.LiteRtLmEngine
import com.shalik.core.llm.ModelManager
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object LlmModule {

    @Provides
    @Singleton
    fun provideDeviceCapabilityDetector(
        @ApplicationContext context: Context
    ): DeviceCapabilityDetector = DeviceCapabilityDetector(context)

    @Provides
    @Singleton
    fun provideModelManager(
        @ApplicationContext context: Context,
        deviceCapabilityDetector: DeviceCapabilityDetector
    ): ModelManager = ModelManager(context, deviceCapabilityDetector)

    @Provides
    @Singleton
    fun provideLiteRtLmEngine(
        @ApplicationContext context: Context,
        modelManager: ModelManager
    ): LiteRtLmEngine = LiteRtLmEngine(context, modelManager)
}
