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
  ActivityIndicator,
  Image
} from 'react-native';
import { AssistantViewModel, AssistantUiState } from '../viewmodel/AssistantViewModel';
import { ChatMessage, MessageSender } from '../../../core/data/models/ChatMessage';
import { BanglaFormatters } from '../util/BanglaFormatters';
import { Colors } from '../../../theme/colors';
import { LanguageManager } from '../../../i18n/LanguageManager';
import { Language } from '../../../i18n/translations';
import { SyncManager, SyncState } from '../../../core/sync/SyncManager';

interface AssistantScreenProps {
  viewModel: AssistantViewModel;
}

export const AssistantScreen: React.FC<AssistantScreenProps> = ({ viewModel }) => {
  const syncManager = SyncManager.getInstance();
  const [uiState, setUiState] = useState<AssistantUiState>(viewModel.getState());
  const [syncState, setSyncState] = useState<SyncState>(syncManager.getState());
  const [inputText, setInputText] = useState('');
  const [transcriptInput, setTranscriptInput] = useState('');
  const [lang, setLang] = useState<Language>(LanguageManager.getInstance().getLanguage());
  const scrollViewRef = useRef<ScrollView>(null);

  const t = LanguageManager.getInstance().getTranslations();

  useEffect(() => {
    const unsubVm = viewModel.subscribe(newState => {
      setUiState(newState);
      if (newState.pendingVoiceTranscript) {
        setTranscriptInput(newState.pendingVoiceTranscript);
      }
    });

    const unsubLang = LanguageManager.getInstance().subscribe(newLang => {
      setLang(newLang);
    });

    const unsubSync = syncManager.subscribe(newSyncState => {
      setSyncState(newSyncState);
    });

    return () => {
      unsubVm();
      unsubLang();
      unsubSync();
    };
  }, [viewModel]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [uiState.messages.length, uiState.streamingText]);

  const handleSend = () => {
    if (inputText.trim()) {
      viewModel.sendQuery(inputText.trim()).then(() => {
        syncManager.syncAll();
      });
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

  const handlePickImage = () => {
    if (typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target?.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result as string;
            if (result) {
              viewModel.attachImage(result, 130);
            }
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      if (uiState.attachedImageUri) {
        viewModel.removeAttachedImage();
      } else {
        viewModel.attachImage('file:///mock/leaf_image.jpg', 130);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarContent}>
          <Text style={styles.appTitle}>{t.appTitle}</Text>
          <Text style={styles.appSubtitle}>{t.appSubtitle}</Text>
        </View>

        <View style={styles.topBarActions}>
          {/* Language Toggle Button */}
          <TouchableOpacity
            style={styles.langToggleBtn}
            onPress={() => LanguageManager.getInstance().toggleLanguage()}
          >
            <Text style={styles.langToggleText}>
              {lang === 'bn' ? 'বাংলা | EN' : 'EN | বাংলা'}
            </Text>
          </TouchableOpacity>

          {/* New Chat Button */}
          <TouchableOpacity
            style={styles.newChatBtn}
            onPress={() => viewModel.startNewConversation()}
          >
            <Text style={styles.newChatBtnText}>{t.newChat}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dynamic Offline / Online Cloud Sync Status Banner */}
      <TouchableOpacity
        style={styles.statusBanner}
        onPress={() => syncManager.syncAll()}
        activeOpacity={0.8}
      >
        <View style={styles.syncStatusLeft}>
          <View
            style={[
              styles.syncDot,
              {
                backgroundColor: !syncState.isOnline
                  ? '#FF9800'
                  : syncState.status === 'syncing'
                  ? '#2196F3'
                  : '#4CAF50'
              }
            ]}
          />
          <Text style={styles.statusText}>
            {!syncState.isOnline
              ? (lang === 'en' ? 'Offline Mode (Local Storage)' : 'অফলাইন মোড (স্থানীয় সংরক্ষণ)')
              : syncState.status === 'syncing'
              ? (lang === 'en' ? 'Syncing to Cloud...' : 'ক্লাউড সিঙ্ক হচ্ছে...')
              : syncState.pendingCount > 0
              ? (lang === 'en'
                  ? `Online • ${syncState.pendingCount} pending sync`
                  : `অনলাইন • ${BanglaFormatters.toBanglaDigits(syncState.pendingCount)}টি তথ্য সিঙ্ক বাকি`)
              : (lang === 'en' ? 'Online • Cloud Synced' : 'অনলাইন • ক্লাউড সিঙ্ক সম্পন্ন')}
          </Text>
        </View>
        <Text style={styles.hotlineText}>{t.emergencyHotline}</Text>
      </TouchableOpacity>

      {/* Attached Image Notice & Thumbnail Preview */}
      {uiState.attachedImageUri && (
        <View style={styles.imageNoticeBanner}>
          <View style={styles.imageNoticeLeft}>
            {Boolean(
              uiState.attachedImageUri.startsWith('data:image/') ||
              uiState.attachedImageUri.startsWith('http') ||
              uiState.attachedImageUri.startsWith('file://')
            ) && (
              <Image
                source={{ uri: uiState.attachedImageUri }}
                style={styles.imageThumbnail}
                resizeMode="cover"
              />
            )}
            <View style={styles.imageNoticeTextContainer}>
              <Text style={styles.imageNoticeText}>{t.imageAttached}</Text>
              {uiState.imageQualityWarning && (
                <Text style={styles.imageWarningText}>⚠️ {uiState.imageQualityWarning}</Text>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.removeImageBtn}
            onPress={() => viewModel.removeAttachedImage()}
          >
            <Text style={styles.removeImageText}>{t.removeImage}</Text>
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
            <Text style={styles.suggestionsHeader}>{t.quickQuestionsHeader}</Text>
            {t.suggestions.map((s, idx) => (
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
                  <Text style={styles.shalikSenderLabel}>{t.shalikAdvice}</Text>
                  <TouchableOpacity
                    style={styles.audioPlayBtn}
                    onPress={() => viewModel.playMessageAudio(msg.text)}
                  >
                    <Text style={styles.audioPlayBtnText}>
                      {uiState.ttsState.type === 'Speaking' ? t.listening : t.listen}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {msg.imageUri && (
                <View style={styles.bubbleImageContainer}>
                  <Image
                    source={{ uri: msg.imageUri }}
                    style={styles.bubbleImage}
                    resizeMode="cover"
                  />
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
                    {t.sourcesPrefix}
                    {msg.citedSources.join(', ')}
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
                <Text style={styles.shalikSenderLabel}>{t.shalikWriting}</Text>
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
            {t.listeningVoice}{' '}
            {BanglaFormatters.formatDigits(
              Math.floor(uiState.recordingState.durationMs / 1000),
              lang
            )}{' '}
            {t.seconds}
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
          onPress={handlePickImage}
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
          placeholder={t.inputPlaceholder}
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
            <Text style={styles.modalTitle}>{t.voiceDialogTitle}</Text>
            <TextInput
              style={styles.modalInput}
              value={transcriptInput}
              onChangeText={setTranscriptInput}
              multiline
            />
            <Text style={styles.modalHint}>{t.voiceDialogHint}</Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => viewModel.dismissVoiceTranscript()}
              >
                <Text style={styles.modalCancelText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={() => viewModel.confirmVoiceTranscript(transcriptInput)}
              >
                <Text style={styles.modalConfirmText}>{t.confirmAndSend}</Text>
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
    paddingVertical: 10
  },
  topBarContent: {
    flex: 1
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  langToggleBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.agriculturalGreenSoft
  },
  langToggleText: {
    color: Colors.agriculturalGreen,
    fontWeight: 'bold',
    fontSize: 11
  },
  appTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold'
  },
  appSubtitle: {
    color: Colors.agriculturalGreenSoft,
    fontSize: 11,
    marginTop: 1
  },
  newChatBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14
  },
  newChatBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12
  },
  statusBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.agriculturalGreenBanner,
    paddingHorizontal: 16,
    paddingVertical: 6
  },
  syncStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6
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
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE082'
  },
  imageNoticeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8
  },
  imageThumbnail: {
    width: 44,
    height: 44,
    borderRadius: 6,
    marginRight: 10,
    backgroundColor: '#E0E0E0'
  },
  imageNoticeTextContainer: {
    flex: 1
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
  removeImageBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4
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
  bubbleImageContainer: {
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden'
  },
  bubbleImage: {
    width: 200,
    height: 140,
    borderRadius: 8,
    backgroundColor: '#EEEEEE'
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
