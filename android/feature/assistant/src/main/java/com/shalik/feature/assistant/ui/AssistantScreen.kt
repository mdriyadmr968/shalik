package com.shalik.feature.assistant.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.shalik.core.data.model.ChatMessage
import com.shalik.core.data.model.MessageSender
import com.shalik.feature.assistant.viewmodel.AssistantUiState

val AgriculturalGreen = Color(0xFF1B5E20)
val AgriculturalLightGreen = Color(0xFFE8F5E9)
val SoilBrown = Color(0xFF5D4037)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AssistantScreen(
    uiState: AssistantUiState,
    onSendQuery: (String) -> Unit,
    onCancelGeneration: () -> Unit,
    onNewConversation: () -> Unit,
    modifier: Modifier = Modifier
) {
    var textInput by remember { mutableStateOf("") }
    val listState = rememberLazyListState()

    LaunchedEffect(uiState.messages.size, uiState.streamingText) {
        if (uiState.messages.isNotEmpty() || uiState.streamingText.isNotEmpty()) {
            listState.animateScrollToItem(
                (uiState.messages.size + (if (uiState.streamingText.isNotEmpty()) 1 else 0)).coerceAtLeast(0)
            )
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "শালিক (Shalik)",
                            fontWeight = FontWeight.Bold,
                            fontSize = 20.sp,
                            color = Color.White
                        )
                        Text(
                            text = "ইন্টারনেট ছাড়াই মাঠের কৃষি সহকারী",
                            fontSize = 12.sp,
                            color = Color(0xFFC8E6C9)
                        )
                    }
                },
                actions = {
                    IconButton(onClick = onNewConversation) {
                        Icon(
                            imageVector = Icons.Default.Add,
                            contentDescription = "নতুন কথোপকথন",
                            tint = Color.White
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = AgriculturalGreen
                )
            )
        },
        modifier = modifier
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(Color(0xFFF9FBE7)) // Warm sunlight-readable background
        ) {
            // Offline Status & Safety Banner
            Surface(
                color = Color(0xFFDCEDC8),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "🟢 সম্পূর্ণ অফলাইন মোড সক্রিয়",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = AgriculturalGreen
                    )
                    Text(
                        text = "জরুরিতে: ১৬১২৩",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = SoilBrown
                    )
                }
            }

            // Quick Agricultural Suggestions (when chat is empty)
            if (uiState.messages.isEmpty() && uiState.streamingText.isEmpty()) {
                QuickSuggestionsView(onSelectSuggestion = { suggestion ->
                    onSendQuery(suggestion)
                })
            }

            // Chat Messages List
            LazyColumn(
                state = listState,
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(uiState.messages, key = { it.id }) { message ->
                    MessageBubble(message = message)
                }

                // Temporary Streaming Bubble
                if (uiState.streamingText.isNotEmpty()) {
                    item {
                        StreamingMessageBubble(text = uiState.streamingText)
                    }
                }
            }

            // Error display if any
            if (uiState.error != null) {
                Surface(
                    color = MaterialTheme.colorScheme.errorContainer,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = uiState.error,
                        color = MaterialTheme.colorScheme.onErrorContainer,
                        modifier = Modifier.padding(8.dp),
                        fontSize = 12.sp
                    )
                }
            }

            // Bottom Input Bar
            Surface(
                tonalElevation = 4.dp,
                color = Color.White,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 8.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Camera Action
                    IconButton(
                        onClick = { /* M2 integration */ },
                        modifier = Modifier.size(44.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.CameraAlt,
                            contentDescription = "গাছের ছবি তুলুন",
                            tint = AgriculturalGreen
                        )
                    }

                    // Voice Input Action
                    IconButton(
                        onClick = { /* M2 voice integration */ },
                        modifier = Modifier.size(44.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Mic,
                            contentDescription = "মুখে বলে প্রশ্ন করুন",
                            tint = AgriculturalGreen
                        )
                    }

                    // Text Input
                    OutlinedTextField(
                        value = textInput,
                        onValueChange = { textInput = it },
                        placeholder = { Text("ফসলের সমস্যা লিখুন...", fontSize = 14.sp) },
                        modifier = Modifier
                            .weight(1f)
                            .padding(horizontal = 4.dp),
                        maxLines = 3,
                        shape = RoundedCornerShape(24.dp)
                    )

                    // Send / Stop button
                    if (uiState.isGenerating) {
                        IconButton(
                            onClick = onCancelGeneration,
                            modifier = Modifier
                                .size(44.dp)
                                .background(MaterialTheme.colorScheme.error, CircleShape)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Stop,
                                contentDescription = "থামান",
                                tint = Color.White
                            )
                        }
                    } else {
                        IconButton(
                            onClick = {
                                if (textInput.isNotBlank()) {
                                    onSendQuery(textInput)
                                    textInput = ""
                                }
                            },
                            enabled = textInput.isNotBlank(),
                            modifier = Modifier
                                .size(44.dp)
                                .background(
                                    if (textInput.isNotBlank()) AgriculturalGreen else Color.LightGray,
                                    CircleShape
                                )
                        ) {
                            Icon(
                                imageVector = Icons.Default.Send,
                                contentDescription = "পাঠান",
                                tint = Color.White
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun MessageBubble(message: ChatMessage) {
    val isUser = message.sender == MessageSender.USER
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start
    ) {
        Surface(
            color = if (isUser) AgriculturalGreen else Color.White,
            shape = RoundedCornerShape(
                topStart = 16.dp,
                topEnd = 16.dp,
                bottomStart = if (isUser) 16.dp else 4.dp,
                bottomEnd = if (isUser) 4.dp else 16.dp
            ),
            shadowElevation = 2.dp,
            modifier = Modifier.widthIn(max = 320.dp)
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                if (!isUser) {
                    Text(
                        text = "শালিকের পরামর্শ",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = SoilBrown,
                        modifier = Modifier.padding(bottom = 4.dp)
                    )
                }
                Text(
                    text = message.text,
                    fontSize = 15.sp,
                    color = if (isUser) Color.White else Color(0xFF212121),
                    lineHeight = 22.sp
                )
            }
        }
    }
}

@Composable
fun StreamingMessageBubble(text: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.Start
    ) {
        Surface(
            color = Color.White,
            shape = RoundedCornerShape(16.dp),
            shadowElevation = 2.dp,
            modifier = Modifier.widthIn(max = 320.dp)
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                Text(
                    text = "শালিক লিখছে...",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = SoilBrown,
                    modifier = Modifier.padding(bottom = 4.dp)
                )
                Text(
                    text = "$text ✍️",
                    fontSize = 15.sp,
                    color = Color(0xFF212121),
                    lineHeight = 22.sp
                )
            }
        }
    }
}

@Composable
fun QuickSuggestionsView(onSelectSuggestion: (String) -> Unit) {
    val suggestions = listOf(
        "ধানের পাতায় বাদামী দাগ পড়েছে, কি করব?",
        "বোরো ধানে ইউরিয়া সার দেওয়ার সঠিক নিয়ম কি?",
        "আলুর নাবি ধসা রোগের লক্ষণ ও প্রতিকার কি?",
        "বেগুনের ডগা ও ফল ছিদ্রকারী পোকা কিভাবে দমন করব?"
    )

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Text(
            text = "কৃষকদের সাধারণ প্রশ্নসমূহ:",
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = SoilBrown,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        suggestions.forEach { suggestion ->
            ElevatedCard(
                onClick = { onSelectSuggestion(suggestion) },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp),
                colors = CardDefaults.elevatedCardColors(containerColor = Color.White)
            ) {
                Text(
                    text = "🌱 $suggestion",
                    modifier = Modifier.padding(12.dp),
                    fontSize = 13.sp,
                    color = Color(0xFF2E7D32)
                )
            }
        }
    }
}
