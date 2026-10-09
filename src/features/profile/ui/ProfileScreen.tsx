import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert
} from 'react-native';
import { FarmerProfileRepository } from '../../../core/data/repository/FarmerProfileRepository';
import { FarmerProfile } from '../../../core/data/models/FarmerProfile';
import { Colors } from '../../../theme/colors';

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
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    repository.getFarmerProfile().then(p => {
      setProfile(p);
      setFarmerName(p.farmerName);
      setDistrict(p.district);
      setUpazila(p.upazila);
      setCropsText(p.primaryCrops.join(', '));
    });
  }, [repository]);

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
      primaryCrops: crops
    };

    await repository.saveProfile(updated);
    setProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>কৃষক প্রোফাইল ও সেটিংস</Text>
        <Text style={styles.topBarSubtitle}>ব্যক্তিগত তথ্য ও ফসলের বিবরণ</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.card}>
          <Text style={styles.label}>কৃষকের নাম:</Text>
          <TextInput
            style={styles.input}
            value={farmerName}
            onChangeText={setFarmerName}
            placeholder="আপনার নাম লিখুন"
          />

          <Text style={styles.label}>জেলা:</Text>
          <TextInput
            style={styles.input}
            value={district}
            onChangeText={setDistrict}
            placeholder="যেমন: কুড়িগ্রাম, রাজশাহী"
          />

          <Text style={styles.label}>উপজেলা:</Text>
          <TextInput
            style={styles.input}
            value={upazila}
            onChangeText={setUpazila}
            placeholder="যেমন: চিলমারী, উলিপুর"
          />

          <Text style={styles.label}>প্রধান ফসলসমূহ (কমা দিয়ে আলাদা করুন):</Text>
          <TextInput
            style={styles.input}
            value={cropsText}
            onChangeText={setCropsText}
            placeholder="ধান, গম, আলু, ভুট্টা"
          />

          {savedSuccess && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>✓ প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে!</Text>
            </View>
          )}

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>সংরক্ষণ করুন</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🔒 সম্পূর্ণ অফলাইন ও নিরাপদ</Text>
          <Text style={styles.infoDesc}>
            শালিক-এ আপনার কোনো তথ্য ক্লাউড বা ইন্টারনেটে পাঠানো হয় না। আপনার সমস্ত তথ্য এই ফোনে সুরক্ষিতভাবে সংরক্ষিত থাকে।
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
    backgroundColor: Colors.soilBrown,
    paddingHorizontal: 16,
    paddingVertical: 14
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
  }
});
