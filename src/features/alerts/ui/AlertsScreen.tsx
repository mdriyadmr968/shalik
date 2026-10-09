import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  SafeAreaView
} from 'react-native';
import { AlertsViewModel, AlertsUiState } from '../viewmodel/AlertsViewModel';
import { ShalikAlert, AlertType } from '../../../core/data/models/Alert';
import { Colors } from '../../../theme/colors';
import { LanguageManager } from '../../../i18n/LanguageManager';
import { Language } from '../../../i18n/translations';

interface AlertsScreenProps {
  viewModel: AlertsViewModel;
}

export const AlertsScreen: React.FC<AlertsScreenProps> = ({ viewModel }) => {
  const [uiState, setUiState] = useState<AlertsUiState>(viewModel.getState());
  const [lang, setLang] = useState<Language>(LanguageManager.getInstance().getLanguage());

  const t = LanguageManager.getInstance().getTranslations();

  useEffect(() => {
    const unsubVm = viewModel.subscribe(newState => {
      setUiState(newState);
    });
    const unsubLang = LanguageManager.getInstance().subscribe(newLang => {
      setLang(newLang);
    });

    return () => {
      unsubVm();
      unsubLang();
    };
  }, [viewModel]);

  const getTypeIcon = (type: AlertType) => {
    switch (type) {
      case AlertType.FLOOD:
        return '🌊';
      case AlertType.HEAT:
        return '☀️';
      case AlertType.CYCLONE:
        return '🌪️';
      case AlertType.HEAVY_RAIN:
        return '⛈️';
      case AlertType.COLD:
        return '❄️';
      default:
        return '⚠️';
    }
  };

  const getSeverityColors = (level: number) => {
    if (level >= 3) {
      return {
        bg: Colors.alertEmergencyBg,
        badge: Colors.warningRed,
        border: '#FFCDD2'
      };
    } else if (level === 2) {
      return {
        bg: Colors.alertWatchBg,
        badge: Colors.amberWatch,
        border: '#FFE0B2'
      };
    } else {
      return {
        bg: Colors.alertAdvisoryBg,
        badge: Colors.advisoryGreen,
        border: '#C8E6C9'
      };
    }
  };

  const getSeverityLabel = (alert: ShalikAlert) => {
    if (lang === 'en') {
      switch (alert.severity.level) {
        case 4:
          return 'Emergency';
        case 3:
          return 'Warning';
        case 2:
          return 'Watch';
        case 1:
        default:
          return 'Advisory';
      }
    }
    return alert.severity.labelBn;
  };

  const getAlertMessage = (alert: ShalikAlert) => {
    if (lang === 'en' && alert.messageEn) {
      return alert.messageEn;
    }
    return alert.messageBn;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <View style={styles.topBarContent}>
          <Text style={styles.topBarTitle}>{t.alertsTitle}</Text>
          <Text style={styles.topBarSubtitle}>{t.alertsSubtitle}</Text>
        </View>

        {/* Language Toggle Button */}
        <TouchableOpacity
          style={styles.langToggleBtn}
          onPress={() => LanguageManager.getInstance().toggleLanguage()}
        >
          <Text style={styles.langToggleText}>
            {lang === 'bn' ? 'বাংলা | EN' : 'EN | বাংলা'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {uiState.alerts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>✓</Text>
            <Text style={styles.emptyTitle}>{t.noAlertsTitle}</Text>
            <Text style={styles.emptySubtitle}>{t.noAlertsSubtitle}</Text>
          </View>
        ) : (
          uiState.alerts.map(alert => {
            const colors = getSeverityColors(alert.severity.level);
            const message = getAlertMessage(alert);

            return (
              <TouchableOpacity
                key={alert.id}
                style={[
                  styles.alertCard,
                  { backgroundColor: colors.bg, borderColor: colors.border }
                ]}
                onPress={() => viewModel.selectAlert(alert)}
              >
                {/* Header row */}
                <View style={styles.cardHeaderRow}>
                  <View style={styles.typeRow}>
                    <Text style={styles.typeIconText}>{getTypeIcon(alert.type)}</Text>
                    <View style={[styles.badge, { backgroundColor: colors.badge }]}>
                      <Text style={styles.badgeText}>{getSeverityLabel(alert)}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.audioBtn}
                    onPress={() => viewModel.playAlertAudio(message)}
                  >
                    <Text style={[styles.audioBtnText, { color: colors.badge }]}>
                      {t.listenAlert}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Message */}
                <Text style={styles.alertMessage}>{message}</Text>

                {/* Footer row */}
                <View style={styles.cardFooterRow}>
                  <Text style={styles.sourceText}>
                    {t.sourcePrefix}
                    {alert.source}
                  </Text>
                  <Text style={[styles.ctaText, { color: colors.badge }]}>
                    {t.viewActionSteps}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Detail Action Steps Modal */}
      <Modal
        visible={uiState.selectedAlert !== null}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView style={styles.modalScroll}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalWarningIcon}>⚠️</Text>
                <Text style={styles.modalTitle}>{t.modalAlertTitle}</Text>
              </View>

              {uiState.selectedAlert && (
                <Text style={styles.modalAlertMessage}>
                  {getAlertMessage(uiState.selectedAlert)}
                </Text>
              )}

              <View style={styles.modalDivider} />

              <Text style={styles.modalStepsHeader}>{t.expertStepsHeader}</Text>

              {uiState.selectedTemplates.map((template, tIdx) => {
                const title = lang === 'en' ? template.titleEn : template.titleBn;
                const steps = lang === 'en' ? template.actionStepsEn : template.actionStepsBn;
                const urgency = lang === 'en' ? template.urgencyNoteEn : template.urgencyNoteBn;

                return (
                  <View key={tIdx} style={styles.templateSection}>
                    <Text style={styles.templateTitle}>📌 {title}</Text>
                    {steps.map((step, sIdx) => (
                      <Text key={sIdx} style={styles.templateStep}>
                        {sIdx + 1}. {step}
                      </Text>
                    ))}
                    <Text style={styles.urgencyNote}>⚠️ {urgency}</Text>
                  </View>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => viewModel.dismissDetail()}
            >
              <Text style={styles.modalCloseText}>{t.understood}</Text>
            </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.alertAdvisoryBg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#C8E6C9'
  },
  topBarContent: {
    flex: 1
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary
  },
  topBarSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2
  },
  langToggleBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#A5D6A7'
  },
  langToggleText: {
    color: Colors.agriculturalGreen,
    fontWeight: 'bold',
    fontSize: 11
  },
  container: {
    flex: 1
  },
  contentContainer: {
    padding: 16
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyIcon: {
    fontSize: 48,
    color: Colors.advisoryGreen,
    marginBottom: 12
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.advisoryGreen,
    marginBottom: 4
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary
  },
  alertCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    elevation: 2
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  typeIconText: {
    fontSize: 18
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold'
  },
  audioBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.7)'
  },
  audioBtnText: {
    fontSize: 11,
    fontWeight: 'bold'
  },
  alertMessage: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 21,
    marginBottom: 10
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sourceText: {
    fontSize: 11,
    color: Colors.textSecondary
  },
  ctaText: {
    fontSize: 11,
    fontWeight: 'bold'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    width: '100%',
    maxHeight: '80%'
  },
  modalScroll: {
    marginBottom: 16
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10
  },
  modalWarningIcon: {
    fontSize: 20
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary
  },
  modalAlertMessage: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
    marginBottom: 10
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 10
  },
  modalStepsHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.agriculturalGreen,
    marginBottom: 8
  },
  templateSection: {
    marginBottom: 12,
    backgroundColor: '#F9FBE7',
    padding: 10,
    borderRadius: 8
  },
  templateTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.soilBrown,
    marginBottom: 6
  },
  templateStep: {
    fontSize: 12,
    color: Colors.textPrimary,
    lineHeight: 18,
    marginLeft: 6,
    marginBottom: 3
  },
  urgencyNote: {
    fontSize: 11,
    color: Colors.warningRed,
    marginTop: 6,
    fontStyle: 'italic'
  },
  modalCloseBtn: {
    backgroundColor: Colors.agriculturalGreen,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14
  }
});
