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
import { UserRole } from '../../../core/auth/models/User';
import { Colors } from '../../../theme/colors';
import { LanguageManager } from '../../../i18n/LanguageManager';
import { Language } from '../../../i18n/translations';

interface AuthScreenProps {
  onLoginSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('01711000001');
  const [pin, setPin] = useState('1234');

  // Registration state
  const [name, setName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPin, setRegPin] = useState('');
  const [regRole, setRegRole] = useState<UserRole>(UserRole.FARMER);
  const [district, setDistrict] = useState('কুড়িগ্রাম');
  const [upazila, setUpazila] = useState('চিলমারী');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lang, setLang] = useState<Language>(LanguageManager.getInstance().getLanguage());

  const t = LanguageManager.getInstance().getTranslations();
  const authManager = AuthManager.getInstance();

  useEffect(() => {
    const unsubLang = LanguageManager.getInstance().subscribe(newLang => {
      setLang(newLang);
    });
    return () => unsubLang();
  }, []);

  const handleLogin = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    const result = await authManager.login(phone, pin);
    setIsLoading(false);

    if (result.success) {
      if (onLoginSuccess) onLoginSuccess();
    } else {
      setErrorMessage(result.error || 'লগইন ব্যর্থ হয়েছে');
    }
  };

  const handleRegister = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    const result = await authManager.register({
      phone: regPhone,
      pin: regPin,
      name,
      role: regRole,
      district,
      upazila
    });
    setIsLoading(false);

    if (result.success) {
      if (onLoginSuccess) onLoginSuccess();
    } else {
      setErrorMessage(result.error || 'নিবন্ধন ব্যর্থ হয়েছে');
    }
  };

  const handleQuickDemoLogin = async (role: UserRole) => {
    setErrorMessage(null);
    setIsLoading(true);
    const result = await authManager.quickLogin(role);
    setIsLoading(false);

    if (result.success) {
      if (onLoginSuccess) onLoginSuccess();
    } else {
      setErrorMessage(result.error || 'ডেমো লগইন ব্যর্থ হয়েছে');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <View style={styles.topBarContent}>
          <Text style={styles.topBarTitle}>🌾 {t.authTitle}</Text>
          <Text style={styles.topBarSubtitle}>{t.authSubtitle}</Text>
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
        {/* Quick 1-Tap Demo Logins */}
        <View style={styles.demoBox}>
          <Text style={styles.demoTitle}>{t.quickDemoLogin}</Text>
          <View style={styles.demoButtonsContainer}>
            <TouchableOpacity
              style={[styles.demoBtn, { borderColor: Colors.agriculturalGreen }]}
              onPress={() => handleQuickDemoLogin(UserRole.FARMER)}
            >
              <Text style={styles.demoBtnTitle}>🌾 {lang === 'en' ? 'Farmer' : 'কৃষক'}</Text>
              <Text style={styles.demoBtnDesc}>{lang === 'en' ? 'Karim Mia' : 'করিম মিয়া'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.demoBtn, { borderColor: '#1976D2' }]}
              onPress={() => handleQuickDemoLogin(UserRole.OFFICER)}
            >
              <Text style={styles.demoBtnTitle}>🛡️ {lang === 'en' ? 'SAAO Officer' : 'কর্মকর্তা'}</Text>
              <Text style={styles.demoBtnDesc}>{lang === 'en' ? 'Dr. Rafiqul' : 'ড. রফিকুল'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.demoBtn, { borderColor: '#7B1FA2' }]}
              onPress={() => handleQuickDemoLogin(UserRole.ADMIN)}
            >
              <Text style={styles.demoBtnTitle}>⚙️ {lang === 'en' ? 'Admin' : 'প্রশাসক'}</Text>
              <Text style={styles.demoBtnDesc}>{lang === 'en' ? 'Agri Admin' : 'সিস্টেম অ্যাডমিন'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab switch */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'login' && styles.tabBtnActive]}
            onPress={() => { setTab('login'); setErrorMessage(null); }}
          >
            <Text style={[styles.tabText, tab === 'login' && styles.tabTextActive]}>
              {t.loginTab}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, tab === 'register' && styles.tabBtnActive]}
            onPress={() => { setTab('register'); setErrorMessage(null); }}
          >
            <Text style={[styles.tabText, tab === 'register' && styles.tabTextActive]}>
              {t.registerTab}
            </Text>
          </TouchableOpacity>
        </View>

        {errorMessage && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
          </View>
        )}

        {tab === 'login' ? (
          /* Login Form */
          <View style={styles.card}>
            <Text style={styles.label}>{t.phoneLabel}</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder={t.phonePlaceholder}
              keyboardType="phone-pad"
              maxLength={14}
            />

            <Text style={styles.label}>{t.pinLabel}</Text>
            <TextInput
              style={styles.input}
              value={pin}
              onChangeText={setPin}
              placeholder={t.pinPlaceholder}
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
            />

            <TouchableOpacity
              style={[styles.actionBtn, isLoading && styles.actionBtnDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.actionBtnText}>
                {isLoading ? '...' : t.loginButton}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Register Form */
          <View style={styles.card}>
            <Text style={styles.label}>{t.nameLabel}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={t.namePlaceholder}
            />

            <Text style={styles.label}>{t.phoneLabel}</Text>
            <TextInput
              style={styles.input}
              value={regPhone}
              onChangeText={setRegPhone}
              placeholder={t.phonePlaceholder}
              keyboardType="phone-pad"
              maxLength={14}
            />

            <Text style={styles.label}>{t.pinLabel}</Text>
            <TextInput
              style={styles.input}
              value={regPin}
              onChangeText={setRegPin}
              placeholder={t.pinPlaceholder}
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
            />

            <Text style={styles.label}>{t.roleLabel}</Text>
            <View style={styles.roleChoiceContainer}>
              <TouchableOpacity
                style={[styles.roleChip, regRole === UserRole.FARMER && styles.roleChipActive]}
                onPress={() => setRegRole(UserRole.FARMER)}
              >
                <Text style={[styles.roleChipText, regRole === UserRole.FARMER && styles.roleChipTextActive]}>
                  {t.roleFarmer}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleChip, regRole === UserRole.OFFICER && styles.roleChipActive]}
                onPress={() => setRegRole(UserRole.OFFICER)}
              >
                <Text style={[styles.roleChipText, regRole === UserRole.OFFICER && styles.roleChipTextActive]}>
                  {t.roleOfficer}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleChip, regRole === UserRole.ADMIN && styles.roleChipActive]}
                onPress={() => setRegRole(UserRole.ADMIN)}
              >
                <Text style={[styles.roleChipText, regRole === UserRole.ADMIN && styles.roleChipTextActive]}>
                  {t.roleAdmin}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>{t.districtLabel}</Text>
            <TextInput
              style={styles.input}
              value={district}
              onChangeText={setDistrict}
              placeholder="কুড়িগ্রাম"
            />

            <Text style={styles.label}>{t.upazilaLabel}</Text>
            <TextInput
              style={styles.input}
              value={upazila}
              onChangeText={setUpazila}
              placeholder="চিলমারী"
            />

            <TouchableOpacity
              style={[styles.actionBtn, isLoading && styles.actionBtnDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={styles.actionBtnText}>
                {isLoading ? '...' : t.registerButton}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.offlineSecurityCard}>
          <Text style={styles.offlineSecurityTitle}>🔒 {lang === 'en' ? 'Offline Secure RBAC' : 'অফলাইন নিরাপদ নিরাপত্তা ব্যবস্থা'}</Text>
          <Text style={styles.offlineSecurityDesc}>
            {lang === 'en'
              ? 'Shalik enforces complete offline privacy with salted cryptographic SHA-256 PIN hashing stored on-device. Zero cloud credentials required.'
              : 'শালিক শতভাগ অফলাইনে ডিভাইসেই সল্টেড SHA-256 ক্রিপ্টোগ্রাফিক হ্যাশ দিয়ে পিন সংরক্ষণ করে। কোনো ইন্টারনেট বা ক্লাউড সার্ভারের প্রয়োজন নেই।'}
          </Text>
        </View>
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
    backgroundColor: Colors.soilBrown,
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  topBarContent: {
    flex: 1
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  topBarSubtitle: {
    fontSize: 12,
    color: '#D7CCC8',
    marginTop: 2
  },
  langToggleBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14
  },
  langToggleText: {
    color: Colors.soilBrown,
    fontWeight: 'bold',
    fontSize: 11
  },
  container: {
    flex: 1
  },
  contentContainer: {
    padding: 16
  },
  demoBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
    elevation: 1
  },
  demoTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.soilBrown,
    marginBottom: 8
  },
  demoButtonsContainer: {
    flexDirection: 'row',
    gap: 8
  },
  demoBtn: {
    flex: 1,
    backgroundColor: '#F9FBE7',
    borderRadius: 8,
    borderWidth: 1.5,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center'
  },
  demoBtnTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textPrimary
  },
  demoBtnDesc: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    padding: 3,
    marginBottom: 16
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    elevation: 2
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575'
  },
  tabTextActive: {
    color: Colors.soilBrown,
    fontWeight: 'bold'
  },
  errorBanner: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#EF5350',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14
  },
  errorText: {
    color: '#C62828',
    fontSize: 12,
    fontWeight: '600'
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
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.soilBrown,
    marginBottom: 4,
    marginTop: 10
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: Colors.textPrimary
  },
  roleChoiceContainer: {
    gap: 8,
    marginTop: 4,
    marginBottom: 8
  },
  roleChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    backgroundColor: '#F5F5F5'
  },
  roleChipActive: {
    borderColor: Colors.agriculturalGreen,
    backgroundColor: '#E8F5E9'
  },
  roleChipText: {
    fontSize: 12,
    color: '#555555',
    fontWeight: '600'
  },
  roleChipTextActive: {
    color: Colors.agriculturalGreen,
    fontWeight: 'bold'
  },
  actionBtn: {
    backgroundColor: Colors.agriculturalGreen,
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 18
  },
  actionBtnDisabled: {
    opacity: 0.6
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15
  },
  offlineSecurityCard: {
    backgroundColor: '#EFEBE9',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D7CCC8'
  },
  offlineSecurityTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.soilBrownDark,
    marginBottom: 4
  },
  offlineSecurityDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18
  }
});
