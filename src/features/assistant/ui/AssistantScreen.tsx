import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { AssistantViewModel, AssistantUiState } from '../viewmodel/AssistantViewModel';
import { ChatMessage, MessageSender } from '../../../core/data/models/ChatMessage';
import { BanglaFormatters } from '../util/BanglaFormatters';
import { Colors } from '../../../theme/colors';

interface AssistantScreenProps {
  viewModel: AssistantViewModel;
}

export const AssistantScreen: React.FC<AssistantScreenProps> = ({ viewModel }) => {
  const [uiState, setUiState] = useState<AssistantUiState>(viewModel.getState());
  const [inputText, setInputText] = useState('');
  const [transcriptInput, setTranscriptInput] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const unsubscribe = viewModel.subscribe(newState => {
      setUiState(newState);
      if (newState.pendingVoiceTranscript) {
        setTranscriptInput(newState.pendingVoiceTranscript);
      }
    });
    return unsubscribe;
  }, [viewModel]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [uiState.messages.length, uiState.streamingText]);

  const handleSend = () => {
    if (inputText.trim()) {
      viewModel.sendQuery(inputText.trim());
      setInputText('');
    }
  };

  const handleToggleRecord = () => {
    if (uiState.recordingState.type === 'Recording') {
      viewModel.stopVoiceRecordingAndTranscribe();
    } else {
      viewModel.startVoiceRecording();
    }
  };

  const handleAttachMockImage = () => {
    if (uiState.attachedImageUri) {
      viewModel.removeAttachedImage();
    } else {
      viewModel.attachImage('file:///mock/leaf_image.jpg', 130);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarContent}>
          <Text style={styles.appTitle}>শালিক (Shalik)</Text>
          <Text style={styles.appSubtitle}>ইন্টারনেট ছাড়াই কণ্ঠ ও চোখের কৃষি সহকারী</Text>
        </View>
        <TouchableOpacity
          style={styles.newChatBtn}
          onPress={() => viewModel.startNewConversation()}
        >
          <Text style={styles.newChatBtnText}>+ নতুন</Text>
        </TouchableOpacity>
      </View>

      {/* Offline Status Banner */}
      <View style={styles.statusBanner}>
        <Text style={styles.statusText}>🟢 সম্পূর্ণ অফলাইন মোড সক্রিয়</Text>
        <Text style={styles.hotlineText}>জরুরিতে: ১৬১২৩</Text>
      </View>

      {/* Attached Image Notice */}
      {uiState.attachedImageUri && (
        <View style={styles.imageNoticeBanner}>
          <Text style={styles.imageNoticeText}>📷 পাতার ছবি সংযুক্ত করা হয়েছে</Text>
          {uiState.imageQualityWarning && (
            <Text style={styles.imageWarningText}>⚠️ {uiState.imageQualityWarning}</Text>
          )}
          <TouchableOpacity onPress={() => viewModel.removeAttachedImage()}>
            <Text style={styles.removeImageText}>✕ মুছুন</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Chat Scroll View */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContentContainer}
      >
        {/* Empty State Suggestions */}
        {uiState.messages.length === 0 && !uiState.streamingText && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsHeader}>কৃষকদের সাধারণ প্রশ্নসমূহ:</Text>
            {[
              'ধানের পাতায় বাদামী দাগ পড়েছে, কি করব?',
              'বোরো ধানে ইউরিয়া সার দেওয়ার সঠিক নিয়ম কি?',
              'আলুর নাবি ধসা রোগের লক্ষণ ও প্রতিকার কি?',
              'বেগুনের ডগা ও ফল ছিদ্রকারী পোকা কিভাবে দমন করব?'
            ].map((s, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.suggestionCard}
                onPress={() => viewModel.sendQuery(s)}
              >
                <Text style={styles.suggestionText}>🌱 {s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Message Bubbles */}
        {uiState.messages.map(msg => (
          <View
            key={msg.id}
            style={[
              styles.messageRow,
              msg.sender === MessageSender.USER ? styles.userRow : styles.shalikRow
            ]}
          >
            <View
              style={[
                styles.bubble,
                msg.sender === MessageSender.USER ? styles.userBubble : styles.shalikBubble
              ]}
            >
              {msg.sender === MessageSender.SHALIK && (
                <View style={styles.shalikHeaderRow}>
                  <Text style={styles.shalikSenderLabel}>শালিকের পরামর্শ</Text>
                  <TouchableOpacity
                    style={styles.audioPlayBtn}
                    onPress={() => viewModel.playMessageAudio(msg.text)}
                  >
                    <Text style={styles.audioPlayBtnText}>
                      {uiState.ttsState.type === 'Speaking' ? '🔊 শুনছেন...' : '🔊 শুনুন'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <Text
                style={[
                  styles.messageText,
                  msg.sender === MessageSender.USER ? styles.userText : styles.shalikText
                ]}
              >
                {msg.text}
              </Text>

              {msg.sender === MessageSender.SHALIK && msg.citedSources.length > 0 && (
                <View style={styles.citationsContainer}>
                  <Text style={styles.citationsText}>
                    📚 সূত্র: {msg.citedSources.join(', ')}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}

        {/* Streaming Message Bubble */}
        {uiState.streamingText.length > 0 && (
          <View style={[styles.messageRow, styles.shalikRow]}>
            <View style={[styles.bubble, styles.shalikBubble]}>
              <View style={styles.streamingHeaderRow}>
                <Text style={styles.shalikSenderLabel}>শালিক লিখছে...</Text>
                <ActivityIndicator size="small" color={Colors.agriculturalGreen} />
              </View>
              <Text style={[styles.messageText, styles.shalikText]}>
                {uiState.streamingText} ✍️
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Voice Recording Active Banner */}
      {uiState.recordingState.type === 'Recording' && (
        <View style={styles.recordingBanner}>
          <Text style={styles.recordingText}>
            🔴 কথা শুনছি...{' '}
            {BanglaFormatters.toBanglaDigits(
              Math.floor(uiState.recordingState.durationMs / 1000)
            )}{' '}
            সেকেন্ড
          </Text>
        </View>
      )}

      {/* Error Banner */}
      {uiState.error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{uiState.error}</Text>
        </View>
      )}

      {/* Bottom Input Area */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleAttachMockImage}
        >
          <Text style={styles.iconButtonText}>
            {uiState.attachedImageUri ? '📷✓' : '📷'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.micButton,
            uiState.recordingState.type === 'Recording' && styles.micButtonActive
          ]}
          onPress={handleToggleRecord}
        >
          <Text style={styles.micButtonText}>
            {uiState.recordingState.type === 'Recording' ? '⏹' : '🎙️'}
          </Text>
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder="ফসলের সমস্যা লিখুন..."
          placeholderTextColor={Colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />

        {uiState.isGenerating ? (
          <TouchableOpacity
            style={styles.stopButton}
            onPress={() => viewModel.cancelGeneration()}
          >
            <Text style={styles.sendButtonText}>⏹</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendButtonText}>➔</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Voice Transcript Confirmation Modal */}
      <Modal
        visible={uiState.pendingVoiceTranscript !== null}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>আপনার মুখের কথা শোনা হয়েছে:</Text>
            <TextInput
              style={styles.modalInput}
              value={transcriptInput}
              onChangeText={setTranscriptInput}
              multiline
            />
            <Text style={styles.modalHint}>
              দরকার হলে লেখাটি পরিবর্তন করে নিশ্চিত করুন।
            </Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => viewModel.dismissVoiceTranscript()}
              >
                <Text style={styles.modalCancelText}>বাতিল</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={() => viewModel.confirmVoiceTranscript(transcriptInput)}
              >
                <Text style={styles.modalConfirmText}>নিশ্চিত ও প্রেরণ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.agriculturalGreen,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  topBarContent: {
    flex: 1
  },
  appTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold'
  },
  appSubtitle: {
    color: Colors.agriculturalGreenSoft,
    fontSize: 12,
    marginTop: 2
  },
  newChatBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  newChatBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13
  },
  statusBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.agriculturalGreenBanner,
    paddingHorizontal: 16,
    paddingVertical: 6
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.agriculturalGreen
  },
  hotlineText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.soilBrown
  },
  imageNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.yellowNoticeBg,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  imageNoticeText: {
    fontSize: 12,
    color: Colors.soilBrown,
    fontWeight: '500'
  },
  imageWarningText: {
    fontSize: 11,
    color: Colors.warningRed
  },
  removeImageText: {
    fontSize: 12,
    color: Colors.warningRed,
    fontWeight: 'bold'
  },
  chatContainer: {
    flex: 1
  },
  chatContentContainer: {
    padding: 12
  },
  suggestionsContainer: {
    padding: 8
  },
  suggestionsHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.soilBrown,
    marginBottom: 8
  },
  suggestionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8F5E9',
    elevation: 1
  },
  suggestionText: {
    fontSize: 13,
    color: Colors.agriculturalGreenLight,
    lineHeight: 18
  },
  messageRow: {
    marginVertical: 6,
    flexDirection: 'row'
  },
  userRow: {
    justifyContent: 'flex-end'
  },
  shalikRow: {
    justifyContent: 'flex-start'
  },
  bubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 16,
    elevation: 2
  },
  userBubble: {
    backgroundColor: Colors.agriculturalGreen,
    borderBottomRightRadius: 4
  },
  shalikBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#EEEEEE'
  },
  shalikHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  streamingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6
  },
  shalikSenderLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.soilBrown
  },
  audioPlayBtn: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12
  },
  audioPlayBtnText: {
    fontSize: 11,
    color: Colors.agriculturalGreen,
    fontWeight: 'bold'
  },
  messageText: {
    fontSize: 14,
    lineHeight: 22
  },
  userText: {
    color: '#FFFFFF'
  },
  shalikText: {
    color: Colors.textPrimary
  },
  citationsContainer: {
    marginTop: 8,
    backgroundColor: Colors.agriculturalGreenBg,
    padding: 6,
    borderRadius: 6
  },
  citationsText: {
    fontSize: 11,
    color: Colors.agriculturalGreen,
    fontWeight: '500'
  },
  recordingBanner: {
    backgroundColor: Colors.recordingBg,
    padding: 10,
    alignItems: 'center'
  },
  recordingText: {
    color: Colors.warningRed,
    fontWeight: 'bold',
    fontSize: 14
  },
  errorBanner: {
    backgroundColor: '#FFEBEE',
    padding: 8
  },
  errorText: {
    color: Colors.warningRed,
    fontSize: 12
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE'
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  iconButtonText: {
    fontSize: 20
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4
  },
  micButtonActive: {
    backgroundColor: Colors.recordingActive
  },
  micButtonText: {
    fontSize: 20
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 90,
    color: Colors.textPrimary
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.agriculturalGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6
  },
  sendButtonDisabled: {
    backgroundColor: '#CCCCCC'
  },
  stopButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.warningRed,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 360
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.textPrimary
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top'
  },
  modalHint: {
    fontSize: 12,
    color: '#777777',
    marginTop: 6,
    marginBottom: 14
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  modalCancelText: {
    color: '#666666',
    fontWeight: '600'
  },
  modalConfirmBtn: {
    backgroundColor: Colors.agriculturalGreen,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontWeight: 'bold'
  }
});
