package com.shalik

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import com.shalik.feature.assistant.ui.AssistantScreen
import com.shalik.feature.assistant.viewmodel.AssistantViewModel
import dagger.hilt.android.AndroidEntryPoint
import java.io.File

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val viewModel: AssistantViewModel = hiltViewModel()
                    val uiState by viewModel.uiState.collectAsState()
                    val tempVoiceFile = File(cacheDir, "current_farmer_voice.wav")

                    AssistantScreen(
                        uiState = uiState,
                        onSendQuery = { query -> viewModel.sendQuery(query) },
                        onCancelGeneration = { viewModel.cancelGeneration() },
                        onNewConversation = { viewModel.startNewConversation() },
                        onPlayAudio = { text -> viewModel.playMessageAudio(text) },
                        onStartVoiceRecording = { viewModel.startVoiceRecording(tempVoiceFile) },
                        onStopVoiceRecording = { viewModel.stopVoiceRecordingAndTranscribe(tempVoiceFile) },
                        onConfirmVoiceTranscript = { text -> viewModel.confirmVoiceTranscript(text) },
                        onDismissVoiceTranscript = { viewModel.dismissVoiceTranscript() }
                    )
                }
            }
        }
    }
}
