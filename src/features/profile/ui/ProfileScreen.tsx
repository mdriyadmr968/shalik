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
import { FarmerProfileRepository } from '../../../core/data/repository/FarmerProfileRepository';
import { FarmerProfile } from '../../../core/data/models/FarmerProfile';
import { Colors } from '../../../theme/colors';
import { LanguageManager } from '../../../i18n/LanguageManager';
import { Language } from '../../../i18n/translations';
import { AuthManager } from '../../../core/auth/AuthManager';
import { User, UserRoleDetails } from '../../../core/auth/models/User';

interface ProfileScreenProps {
  repository?: FarmerProfileRepository;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  repository = new FarmerProfileRepository()
}) => {
  const [profile, setProfile] = useState<FarmerProfile>({
    id: 1,
    farmerName: 'কৃষক ভাই',
    district: 'কুড়িগ্রাম',
    upazila: 'চিলমারী',
    primaryCrops: ['ধান', 'আলু'],
    isOnboarded: true,
    preferredLanguage: 'bn'
  });

  const [farmerName, setFarmerName] = useState(profile.farmerName);
  const [district, setDistrict] = useState(profile.district);
  const [upazila, setUpazila] = useState(profile.upazila);
  const [cropsText, setCropsText] = useState(profile.primaryCrops.join(', '));
  const [lang, setLang] = useState<Language>(LanguageManager.getInstance().getLanguage());
  const [currentUser, setCurrentUser] = useState<User | null>(AuthManager.getInstance().getCurrentUser());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const t = LanguageManager.getInstance().getTranslations();

  useEffect(() => {
    repository.getFarmerProfile().then(p => {
      setProfile(p);
      setFarmerName(p.farmerName);
      setDistrict(p.district);
      setUpazila(p.upazila);
      setCropsText(p.primaryCrops.join(', '));
    });

    const unsubLang = LanguageManager.getInstance().subscribe(newLang => {
      setLang(newLang);
    });

    const unsubAuth = AuthManager.getInstance().subscribe(user => {
      setCurrentUser(user);
    });

    return () => {
      unsubLang();
      unsubAuth();
    };
  }, [repository]);

  const handleLanguageChange = async (selectedLang: Language) => {
    await LanguageManager.getInstance().setLanguage(selectedLang);
    setProfile(prev => ({ ...prev, preferredLanguage: selectedLang }));
  };

  const handleSave = async () => {
    const crops = cropsText
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    const updated: FarmerProfile = {
      ...profile,
      farmerName,
      district,
      upazila,
      primaryCrops: crops,
      preferredLanguage: lang
    };

    await repository.saveProfile(updated);
    setProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <View style={styles.topBarContent}>
          <Text style={styles.topBarTitle}>{t.profileTitle}</Text>
          <Text style={styles.topBarSubtitle}>{t.profileSubtitle}</Text>
        </View>

        {/* Quick Toggle Button */}
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
        <View style={styles.card}>
          {/* Language Selector Section */}
          <Text style={styles.label}>{t.languageSelectLabel}</Text>
          <View style={styles.langChoiceRow}>
            <TouchableOpacity
              style={[
                styles.langChoiceBtn,
                lang === 'bn' && styles.langChoiceBtnActive
              ]}
              onPress={() => handleLanguageChange('bn')}
            >
              <Text
                style={[
                  styles.langChoiceText,
                  lang === 'bn' && styles.langChoiceTextActive
                ]}
              >
                🇧🇩 বাংলা (Bengali)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.langChoiceBtn,
                lang === 'en' && styles.langChoiceBtnActive
              ]}
              onPress={() => handleLanguageChange('en')}
            >
              <Text
                style={[
                  styles.langChoiceText,
                  lang === 'en' && styles.langChoiceTextActive
                ]}
              >
                🌐 English
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>{t.farmerNameLabel}</Text>
          <TextInput
            style={styles.input}
            value={farmerName}
            onChangeText={setFarmerName}
            placeholder={lang === 'en' ? 'Enter farmer name' : 'আপনার নাম লিখুন'}
          />

          <Text style={styles.label}>{t.districtLabel}</Text>
          <TextInput
            style={styles.input}
            value={district}
            onChangeText={setDistrict}
            placeholder={lang === 'en' ? 'e.g. Kurigram, Rajshahi' : 'যেমন: কুড়িগ্রাম, রাজশাহী'}
          />

          <Text style={styles.label}>{t.upazilaLabel}</Text>
          <TextInput
            style={styles.input}
            value={upazila}
            onChangeText={setUpazila}
            placeholder={lang === 'en' ? 'e.g. Chilmari, Ulipur' : 'যেমন: চিলমারী, উলিপুর'}
          />

          <Text style={styles.label}>{t.primaryCropsLabel}</Text>
          <TextInput
            style={styles.input}
            value={cropsText}
            onChangeText={setCropsText}
            placeholder={lang === 'en' ? 'Rice, Wheat, Potato, Maize' : 'ধান, গম, আলু, ভুট্টা'}
          />

          {savedSuccess && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>{t.savedSuccess}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>{t.saveButton}</Text>
          </TouchableOpacity>
        </View>

        {/* Current Auth Account & Sign Out */}
        {currentUser && (
          <View style={styles.accountCard}>
            <View style={styles.accountHeader}>
              <View>
                <Text style={styles.accountTitle}>👤 {currentUser.name}</Text>
                <Text style={styles.accountPhone}>{currentUser.phone}</Text>
              </View>
              <View style={styles.accountBadge}>
                <Text style={styles.accountBadgeText}>
                  {lang === 'en'
                    ? UserRoleDetails[currentUser.role]?.labelEn
                    : UserRoleDetails[currentUser.role]?.labelBn}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => AuthManager.getInstance().logout()}
            >
              <Text style={styles.logoutBtnText}>{t.logoutButton}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{t.offlineSecurityTitle}</Text>
          <Text style={styles.infoDesc}>{t.offlineSecurityDesc}</Text>
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
    paddingVertical: 12
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
  langChoiceRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    marginBottom: 6
  },
  langChoiceBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#DDDDDD',
    alignItems: 'center',
    backgroundColor: '#FAFAFA'
  },
  langChoiceBtnActive: {
    borderColor: Colors.agriculturalGreen,
    backgroundColor: '#E8F5E9'
  },
  langChoiceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666'
  },
  langChoiceTextActive: {
    color: Colors.agriculturalGreen,
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
  successBanner: {
    backgroundColor: Colors.alertAdvisoryBg,
    padding: 10,
    borderRadius: 8,
    marginTop: 14,
    alignItems: 'center'
  },
  successText: {
    color: Colors.advisoryGreen,
    fontWeight: 'bold',
    fontSize: 13
  },
  saveBtn: {
    backgroundColor: Colors.agriculturalGreen,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15
  },
  infoCard: {
    backgroundColor: '#EFEBE9',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D7CCC8'
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.soilBrownDark,
    marginBottom: 4
  },
  infoDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18
  },
  accountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    elevation: 2,
    marginBottom: 16
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  accountTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.textPrimary
  },
  accountPhone: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2
  },
  accountBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C8E6C9'
  },
  accountBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.agriculturalGreen
  },
  logoutBtn: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  logoutBtnText: {
    color: '#D32F2F',
    fontWeight: 'bold',
    fontSize: 14
  }
});
