import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { AssistantScreen } from './src/features/assistant/ui/AssistantScreen';
import { AlertsScreen } from './src/features/alerts/ui/AlertsScreen';
import { ProfileScreen } from './src/features/profile/ui/ProfileScreen';
import { AuthScreen } from './src/features/auth/ui/AuthScreen';
import { AdminScreen } from './src/features/admin/ui/AdminScreen';
import { AssistantViewModel } from './src/features/assistant/viewmodel/AssistantViewModel';
import { AlertsViewModel } from './src/features/alerts/viewmodel/AlertsViewModel';
import { Colors } from './src/theme/colors';
import { LanguageManager } from './src/i18n/LanguageManager';
import { Language } from './src/i18n/translations';
import { AuthManager } from './src/core/auth/AuthManager';
import { User, UserRole, Permission } from './src/core/auth/models/User';

type Tab = 'assistant' | 'alerts' | 'profile' | 'admin';

export default function App() {
  const authManager = AuthManager.getInstance();
  const [currentUser, setCurrentUser] = useState<User | null>(authManager.getCurrentUser());
  const [activeTab, setActiveTab] = useState<Tab>('assistant');
  const [lang, setLang] = useState<Language>(LanguageManager.getInstance().getLanguage());

  const assistantVm = useMemo(() => new AssistantViewModel(), []);
  const alertsVm = useMemo(() => new AlertsViewModel(), []);

  useEffect(() => {
    const unsubLang = LanguageManager.getInstance().subscribe(newLang => {
      setLang(newLang);
    });

    const unsubAuth = authManager.subscribe(user => {
      setCurrentUser(user);
      if (!user) {
        setActiveTab('assistant');
      }
    });

    return () => {
      unsubLang();
      unsubAuth();
    };
  }, []);

  const t = LanguageManager.getInstance().getTranslations();

  // If user is not authenticated, render offline-first Auth screen
  if (!currentUser) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.soilBrown} />
        <AuthScreen onLoginSuccess={() => setActiveTab('assistant')} />
      </View>
    );
  }

  const canAccessAdmin =
    authManager.hasPermission(Permission.BROADCAST_ALERT) ||
    authManager.hasPermission(Permission.VIEW_FIELD_TELEMETRY) ||
    authManager.hasPermission(Permission.MANAGE_USERS);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.agriculturalGreen} />

      <View style={styles.screenContainer}>
        {activeTab === 'assistant' && <AssistantScreen viewModel={assistantVm} />}
        {activeTab === 'alerts' && <AlertsScreen viewModel={alertsVm} />}
        {activeTab === 'profile' && <ProfileScreen />}
        {activeTab === 'admin' && canAccessAdmin && <AdminScreen />}
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

        {/* Officer / Admin Control Tab (RBAC Protected) */}
        {canAccessAdmin && (
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'admin' && styles.tabButtonActive]}
            onPress={() => setActiveTab('admin')}
          >
            <Text style={styles.tabIcon}>🛡️</Text>
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'admin' && styles.tabLabelActive
              ]}
            >
              {currentUser.role === UserRole.ADMIN
                ? (lang === 'en' ? 'Admin' : 'অ্যাডমিন')
                : t.tabAdmin}
            </Text>
          </TouchableOpacity>
        )}

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
