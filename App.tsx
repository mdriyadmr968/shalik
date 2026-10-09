import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { AssistantScreen } from './src/features/assistant/ui/AssistantScreen';
import { AlertsScreen } from './src/features/alerts/ui/AlertsScreen';
import { ProfileScreen } from './src/features/profile/ui/ProfileScreen';
import { AssistantViewModel } from './src/features/assistant/viewmodel/AssistantViewModel';
import { AlertsViewModel } from './src/features/alerts/viewmodel/AlertsViewModel';
import { Colors } from './src/theme/colors';
import { LanguageManager } from './src/i18n/LanguageManager';
import { Language } from './src/i18n/translations';

type Tab = 'assistant' | 'alerts' | 'profile';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('assistant');
  const [lang, setLang] = useState<Language>(LanguageManager.getInstance().getLanguage());

  const assistantVm = useMemo(() => new AssistantViewModel(), []);
  const alertsVm = useMemo(() => new AlertsViewModel(), []);

  useEffect(() => {
    const unsub = LanguageManager.getInstance().subscribe(newLang => {
      setLang(newLang);
    });
    return () => unsub();
  }, []);

  const t = LanguageManager.getInstance().getTranslations();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.agriculturalGreen} />

      <View style={styles.screenContainer}>
        {activeTab === 'assistant' && <AssistantScreen viewModel={assistantVm} />}
        {activeTab === 'alerts' && <AlertsScreen viewModel={alertsVm} />}
        {activeTab === 'profile' && <ProfileScreen />}
      </View>

      {/* Bottom Navigation Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'assistant' && styles.tabButtonActive]}
          onPress={() => setActiveTab('assistant')}
        >
          <Text style={styles.tabIcon}>🌾</Text>
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'assistant' && styles.tabLabelActive
            ]}
          >
            {t.tabAssistant}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'alerts' && styles.tabButtonActive]}
          onPress={() => setActiveTab('alerts')}
        >
          <Text style={styles.tabIcon}>⚠️</Text>
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'alerts' && styles.tabLabelActive
            ]}
          >
            {t.tabAlerts}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'profile' && styles.tabButtonActive]}
          onPress={() => setActiveTab('profile')}
        >
          <Text style={styles.tabIcon}>👤</Text>
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'profile' && styles.tabLabelActive
            ]}
          >
            {t.tabProfile}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  screenContainer: {
    flex: 1
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    elevation: 8
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  tabButtonActive: {
    borderTopWidth: 3,
    borderTopColor: Colors.agriculturalGreen
  },
  tabIcon: {
    fontSize: 20
  },
  tabLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500'
  },
  tabLabelActive: {
    color: Colors.agriculturalGreen,
    fontWeight: 'bold'
  }
});
