package com.shalik.feature.assistant.di

import com.shalik.feature.assistant.speech.GemmaAudioSpeechToText
import com.shalik.feature.assistant.speech.SpeechToText
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class AssistantModule {

    @Binds
    @Singleton
    abstract fun bindSpeechToText(
        gemmaAudioSpeechToText: GemmaAudioSpeechToText
    ): SpeechToText
}
