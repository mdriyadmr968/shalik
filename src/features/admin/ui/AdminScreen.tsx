import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { AuthManager } from '../../../core/auth/AuthManager';
import { User, UserRole, Permission, UserRoleDetails } from '../../../core/auth/models/User';
import { ShalikDatabase } from '../../../core/data/database/ShalikDatabase';
import { AlertEntity } from '../../../core/data/database/Entities';
import { Colors } from '../../../theme/colors';
import { LanguageManager } from '../../../i18n/LanguageManager';
import { Language } from '../../../i18n/translations';

export const AdminScreen: React.FC = () => {
  const authManager = AuthManager.getInstance();
  const db = ShalikDatabase.getInstance();

  const [currentUser, setCurrentUser] = useState<User | null>(authManager.getCurrentUser());
  const [users, setUsers] = useState<User[]>([]);
  const [lang, setLang] = useState<Language>(LanguageManager.getInstance().getLanguage());

  // Broadcast Alert Form State
  const [alertType, setAlertType] = useState<'FLOOD' | 'HEAT' | 'PEST' | 'CYCLONE'>('PEST');
  const [severity, setSeverity] = useState<number>(2);
  const [districtCodes, setDistrictCodes] = useState('কুড়িগ্রাম,রংপুর');
  const [messageBn, setMessageBn] = useState('');
  const [messageEn, setMessageEn] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  const t = LanguageManager.getInstance().getTranslations();

  const canBroadcast = authManager.hasPermission(Permission.BROADCAST_ALERT);
  const canViewTelemetry = authManager.hasPermission(Permission.VIEW_FIELD_TELEMETRY);
  const canManageUsers = authManager.hasPermission(Permission.MANAGE_USERS);

  const reloadUsers = async () => {
    const list = await authManager.getAllUsers();
    setUsers(list);
  };

  useEffect(() => {
    reloadUsers();
    const unsubAuth = authManager.subscribe(u => {
      setCurrentUser(u);
      reloadUsers();
    });
    const unsubLang = LanguageManager.getInstance().subscribe(l => {
      setLang(l);
    });

    return () => {
      unsubAuth();
      unsubLang();
    };
  }, []);

  const handleBroadcastAlert = async () => {
    if (!messageBn.trim()) return;

    const now = Date.now();
    const newAlert: AlertEntity = {
      id: `alert_broadcast_${now}`,
      type: alertType,
      severityLevel: severity,
      districtCodesCsv: districtCodes.trim(),
      upazilaCodesCsv: '',
      validFromIso: new Date(now).toISOString(),
      validToIso: new Date(now + 7 * 24 * 3600 * 1000).toISOString(),
      messageBn: messageBn.trim(),
      messageEn: messageEn.trim() || messageBn.trim(),
      source: currentUser ? `${currentUser.name} (${currentUser.role === UserRole.ADMIN ? 'প্রশাসক' : 'উপ-সহকারী কৃষি কর্মকর্তা'})` : 'কৃষি সম্প্রসারণ অধিদপ্তর',
      actionTemplatesCsv: 'act_general_pest_spray',
      signature: 'sig_officer_verified_offline',
      receivedAt: now,
      isRead: false
    };

    await db.alertDao().insertAlert(newAlert);
    setMessageBn('');
    setMessageEn('');
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 4000);
  };

  const handleChangeUserRole = async (userId: string, newRole: UserRole) => {
    try {
      await authManager.updateUserRole(userId, newRole);
      await reloadUsers();
    } catch (e: any) {
      alert(e.message || 'ভূমিকা পরিবর্তন ব্যর্থ হয়েছে');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <View style={styles.topBarContent}>
          <Text style={styles.topBarTitle}>🛡️ {t.managementTitle}</Text>
          <Text style={styles.topBarSubtitle}>
            {currentUser?.name} | {currentUser?.role && (lang === 'en' ? UserRoleDetails[currentUser.role]?.labelEn : UserRoleDetails[currentUser.role]?.labelBn)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.langToggleBtn}
          onPress={() => LanguageManager.getInstance().toggleLanguage()}
        >
          <Text style={styles.langToggleText}>
            {lang === 'bn' ? 'বাংলা | EN' : 'EN | বাংলা'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Role Badge Card */}
        <View style={styles.badgeCard}>
          <View style={styles.badgeHeader}>
            <Text style={styles.badgeRole}>
              {currentUser?.role === UserRole.ADMIN ? '⚙️ ADMIN' : '🛡️ SAAO OFFICER'}
            </Text>
            <Text style={styles.badgePhone}>{currentUser?.phone}</Text>
          </View>
          <Text style={styles.badgeLocation}>
            📍 {currentUser?.upazila}, {currentUser?.district}
          </Text>
        </View>

        {/* Section 1: Broadcast Alert */}
        {canBroadcast && (
          <View style={styles.card}>
            <Text style={styles.sectionHeader}>📢 {t.broadcastAlertTitle}</Text>
            <Text style={styles.sectionSub}>{t.broadcastAlertDesc}</Text>

            <Text style={styles.label}>{lang === 'en' ? 'Alert Type:' : 'দুর্যোগের ধরন:'}</Text>
            <View style={styles.typeRow}>
              {(['PEST', 'FLOOD', 'HEAT', 'CYCLONE'] as const).map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeChip, alertType === type && styles.typeChipActive]}
                  onPress={() => setAlertType(type)}
                >
                  <Text style={[styles.typeChipText, alertType === type && styles.typeChipTextActive]}>
                    {type === 'PEST' ? '🐛 রোগ-পোকা' : type === 'FLOOD' ? '🌊 বন্যা' : type === 'HEAT' ? '☀️ তাপদাহ' : '🌪️ ঘূর্ণিঝড়'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>{t.alertSeverity}</Text>
            <View style={styles.typeRow}>
              {[
                { level: 1, label: lang === 'en' ? 'Low' : '১: তথ্য' },
                { level: 2, label: lang === 'en' ? 'Moderate' : '২: সতর্কতা' },
                { level: 3, label: lang === 'en' ? 'Severe' : '৩: জরুরি' }
              ].map(s => (
                <TouchableOpacity
                  key={s.level}
                  style={[styles.typeChip, severity === s.level && styles.typeChipActive]}
                  onPress={() => setSeverity(s.level)}
                >
                  <Text style={[styles.typeChipText, severity === s.level && styles.typeChipTextActive]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>{lang === 'en' ? 'Target Districts (comma separated):' : 'টার্গেট জেলাসমূহ (কমা দিয়ে):'}</Text>
            <TextInput
              style={styles.input}
              value={districtCodes}
              onChangeText={setDistrictCodes}
              placeholder="কুড়িগ্রাম, রংপুর, গাইবান্ধা"
            />

            <Text style={styles.label}>{t.alertMessageBn}</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={messageBn}
              onChangeText={setMessageBn}
              placeholder="কৃষকদের উদ্দেশ্যে সতর্কবার্তা ও করণীয় লিখুন..."
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>{t.alertMessageEn}</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={messageEn}
              onChangeText={setMessageEn}
              placeholder="Write advisory in English for multi-lingual display..."
              multiline
              numberOfLines={2}
            />

            {broadcastSuccess && (
              <View style={styles.successBanner}>
                <Text style={styles.successText}>
                  ✓ {lang === 'en' ? 'Alert broadcasted to all regional farmers successfully!' : 'সতর্কবার্তা সফলভাবে প্রচারিত হয়েছে!'}
                </Text>
              </View>
            )}

            <TouchableOpacity style={styles.broadcastBtn} onPress={handleBroadcastAlert}>
              <Text style={styles.broadcastBtnText}>{t.broadcastButton}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Section 2: Field Telemetry */}
        {canViewTelemetry && (
          <View style={styles.card}>
            <Text style={styles.sectionHeader}>📊 {t.telemetryTitle}</Text>
            <Text style={styles.sectionSub}>{t.telemetryDesc}</Text>

            <View style={styles.telemetryGrid}>
              <View style={styles.telemetryItem}>
                <Text style={styles.telemetryVal}>~320 ms</Text>
                <Text style={styles.telemetryLabel}>{lang === 'en' ? 'On-Device SLM Inference' : 'অন-ডিভাইস এআই মডেল লেটেন্সি'}</Text>
              </View>

              <View style={styles.telemetryItem}>
                <Text style={styles.telemetryVal}>1,280 docs</Text>
                <Text style={styles.telemetryLabel}>{lang === 'en' ? 'Indexed Agri Knowledge' : 'ইনডেক্সড অফলাইন কৃষি তথ্য'}</Text>
              </View>

              <View style={styles.telemetryItem}>
                <Text style={styles.telemetryVal}>100% Offline</Text>
                <Text style={styles.telemetryLabel}>{lang === 'en' ? 'Air-Gapped Privacy' : 'এয়ার-গ্যাপড অফলাইন নিরাপত্তা'}</Text>
              </View>

              <View style={styles.telemetryItem}>
                <Text style={styles.telemetryVal}>100% Active</Text>
                <Text style={styles.telemetryLabel}>{lang === 'en' ? 'Pesticide Safety Guardrail' : 'কীটনাশক ডোজ গার্ডরেল'}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Section 3: User & Role Access Control */}
        {canManageUsers && (
          <View style={styles.card}>
            <Text style={styles.sectionHeader}>👥 {t.userManagementTitle}</Text>
            <Text style={styles.sectionSub}>
              {lang === 'en' ? 'Manage registered accounts and assign role privileges' : 'নিবন্ধিত অ্যাকাউন্ট পরিচালনা ও ভূমিকা নির্ধারণ'}
            </Text>

            {users.map(u => (
              <View key={u.id} style={styles.userRow}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{u.name}</Text>
                  <Text style={styles.userPhone}>{u.phone} • {u.upazila}, {u.district}</Text>
                  <View style={styles.roleTag}>
                    <Text style={styles.roleTagText}>{u.role}</Text>
                  </View>
                </View>

                {/* Role modifier chips */}
                <View style={styles.roleActions}>
                  {u.role !== UserRole.FARMER && (
                    <TouchableOpacity
                      style={styles.roleSwitchBtn}
                      onPress={() => handleChangeUserRole(u.id, UserRole.FARMER)}
                    >
                      <Text style={styles.roleSwitchText}>🌾 {lang === 'en' ? 'Farmer' : 'কৃষক'}</Text>
                    </TouchableOpacity>
                  )}

                  {u.role !== UserRole.OFFICER && (
                    <TouchableOpacity
                      style={styles.roleSwitchBtn}
                      onPress={() => handleChangeUserRole(u.id, UserRole.OFFICER)}
                    >
                      <Text style={styles.roleSwitchText}>🛡️ {lang === 'en' ? 'Officer' : 'কর্মকর্তা'}</Text>
                    </TouchableOpacity>
                  )}

                  {u.role !== UserRole.ADMIN && (
                    <TouchableOpacity
                      style={styles.roleSwitchBtn}
                      onPress={() => handleChangeUserRole(u.id, UserRole.ADMIN)}
                    >
                      <Text style={styles.roleSwitchText}>⚙️ {lang === 'en' ? 'Admin' : 'অ্যাডমিন'}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
    backgroundColor: '#37474F',
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  topBarContent: {
    flex: 1
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  topBarSubtitle: {
    fontSize: 12,
    color: '#B0BEC5',
    marginTop: 2
  },
  langToggleBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14
  },
  langToggleText: {
    color: '#37474F',
    fontWeight: 'bold',
    fontSize: 11
  },
  container: {
    flex: 1
  },
  contentContainer: {
    padding: 16
  },
  badgeCard: {
    backgroundColor: '#263238',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16
  },
  badgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  badgeRole: {
    color: '#81C784',
    fontSize: 14,
    fontWeight: 'bold'
  },
  badgePhone: {
    color: '#ECEFF1',
    fontSize: 13
  },
  badgeLocation: {
    color: '#B0BEC5',
    fontSize: 12,
    marginTop: 4
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    elevation: 2,
    marginBottom: 16
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary
  },
  sectionSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 12
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.soilBrown,
    marginTop: 10,
    marginBottom: 4
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6
  },
  typeChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    backgroundColor: '#F5F5F5'
  },
  typeChipActive: {
    borderColor: '#E65100',
    backgroundColor: '#FFF3E0'
  },
  typeChipText: {
    fontSize: 12,
    color: '#555555'
  },
  typeChipTextActive: {
    color: '#E65100',
    fontWeight: 'bold'
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.textPrimary
  },
  multilineInput: {
    minHeight: 65,
    textAlignVertical: 'top'
  },
  broadcastBtn: {
    backgroundColor: '#D84315',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 14
  },
  broadcastBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15
  },
  successBanner: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#81C784',
    padding: 10,
    borderRadius: 8,
    marginTop: 12
  },
  successText: {
    color: '#2E7D32',
    fontWeight: 'bold',
    fontSize: 12
  },
  telemetryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6
  },
  telemetryItem: {
    width: '48%',
    backgroundColor: '#ECEFF1',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#37474F'
  },
  telemetryVal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#263238'
  },
  telemetryLabel: {
    fontSize: 11,
    color: '#546E7A',
    marginTop: 2
  },
  userRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingVertical: 12
  },
  userInfo: {
    marginBottom: 6
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary
  },
  userPhone: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2
  },
  roleTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2F1',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4
  },
  roleTagText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#00695C'
  },
  roleActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4
  },
  roleSwitchBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#B0BEC5',
    backgroundColor: '#FFFFFF'
  },
  roleSwitchText: {
    fontSize: 11,
    color: '#37474F'
  }
});
