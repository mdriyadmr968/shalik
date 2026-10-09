export type Language = 'bn' | 'en';

export interface Translations {
  // Navigation & Tabs
  tabAssistant: string;
  tabAlerts: string;
  tabProfile: string;

  // Assistant Screen
  appTitle: string;
  appSubtitle: string;
  newChat: string;
  offlineActive: string;
  emergencyHotline: string;
  imageAttached: string;
  removeImage: string;
  quickQuestionsHeader: string;
  suggestions: string[];
  shalikAdvice: string;
  listen: string;
  listening: string;
  sourcesPrefix: string;
  shalikWriting: string;
  listeningVoice: string;
  seconds: string;
  inputPlaceholder: string;
  voiceDialogTitle: string;
  voiceDialogHint: string;
  cancel: string;
  confirmAndSend: string;

  // Alerts Screen
  alertsTitle: string;
  alertsSubtitle: string;
  noAlertsTitle: string;
  noAlertsSubtitle: string;
  listenAlert: string;
  viewActionSteps: string;
  modalAlertTitle: string;
  expertStepsHeader: string;
  understood: string;
  sourcePrefix: string;

  // Profile Screen
  profileTitle: string;
  profileSubtitle: string;
  farmerNameLabel: string;
  districtLabel: string;
  upazilaLabel: string;
  primaryCropsLabel: string;
  languageSelectLabel: string;
  savedSuccess: string;
  saveButton: string;
  offlineSecurityTitle: string;
  offlineSecurityDesc: string;
}

export const translations: Record<Language, Translations> = {
  bn: {
    // Navigation & Tabs
    tabAssistant: 'পরামর্শ',
    tabAlerts: 'দুর্যোগ ও আবহাওয়া',
    tabProfile: 'প্রোফাইল',

    // Assistant Screen
    appTitle: 'শালিক (Shalik)',
    appSubtitle: 'ইন্টারনেট ছাড়াই কণ্ঠ ও চোখের কৃষি সহকারী',
    newChat: '+ নতুন',
    offlineActive: '🟢 সম্পূর্ণ অফলাইন মোড সক্রিয়',
    emergencyHotline: 'জরুরিতে: ১৬১২৩',
    imageAttached: '📷 পাতার ছবি সংযুক্ত করা হয়েছে',
    removeImage: '✕ মুছুন',
    quickQuestionsHeader: 'কৃষকদের সাধারণ প্রশ্নসমূহ:',
    suggestions: [
      'ধানের পাতায় বাদামী দাগ পড়েছে, কি করব?',
      'বোরো ধানে ইউরিয়া সার দেওয়ার সঠিক নিয়ম কি?',
      'আলুর নাবি ধসা রোগের লক্ষণ ও প্রতিকার কি?',
      'বেগুনের ডগা ও ফল ছিদ্রকারী পোকা কিভাবে দমন করব?'
    ],
    shalikAdvice: 'শালিকের পরামর্শ',
    listen: '🔊 শুনুন',
    listening: '🔊 শুনছেন...',
    sourcesPrefix: '📚 সূত্র: ',
    shalikWriting: 'শালিক লিখছে...',
    listeningVoice: '🔴 কথা শুনছি...',
    seconds: 'সেকেন্ড',
    inputPlaceholder: 'ফসলের সমস্যা লিখুন...',
    voiceDialogTitle: 'আপনার মুখের কথা শোনা হয়েছে:',
    voiceDialogHint: 'দরকার হলে লেখাটি পরিবর্তন করে নিশ্চিত করুন।',
    cancel: 'বাতিল',
    confirmAndSend: 'নিশ্চিত ও প্রেরণ',

    // Alerts Screen
    alertsTitle: 'দুর্যোগ ও কৃষি আবহাওয়া',
    alertsSubtitle: 'বন্যা, খরা ও তাপদাহ পূর্বাভাস',
    noAlertsTitle: 'কোনো সক্রিয় বিপদ সংকেত নেই',
    noAlertsSubtitle: 'আপনার এলাকার আবহাওয়া স্বাভাবিক আছে।',
    listenAlert: '🔊 বার্তা শুনুন',
    viewActionSteps: 'করণীয় দেখতে স্পর্শ করুন ➔',
    modalAlertTitle: 'জরুরি করণীয় নির্দেশনা',
    expertStepsHeader: 'কৃষি বিশেষজ্ঞের পদক্ষেপসমূহ:',
    understood: 'বুঝেছি',
    sourcePrefix: 'উৎস: ',

    // Profile Screen
    profileTitle: 'কৃষক প্রোফাইল ও সেটিংস',
    profileSubtitle: 'ব্যক্তিগত তথ্য ও ফসলের বিবরণ',
    farmerNameLabel: 'কৃষকের নাম:',
    districtLabel: 'জেলা:',
    upazilaLabel: 'উপজেলা:',
    primaryCropsLabel: 'প্রধান ফসলসমূহ (কমা দিয়ে আলাদা করুন):',
    languageSelectLabel: 'ভাষা নির্বাচন (Language):',
    savedSuccess: '✓ প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে!',
    saveButton: 'সংরক্ষণ করুন',
    offlineSecurityTitle: '🔒 সম্পূর্ণ অফলাইন ও নিরাপদ',
    offlineSecurityDesc:
      'শালিক-এ আপনার কোনো তথ্য ক্লাউড বা ইন্টারনেটে পাঠানো হয় না। আপনার সমস্ত তথ্য এই ফোনে সুরক্ষিতভাবে সংরক্ষিত থাকে।'
  },
  en: {
    // Navigation & Tabs
    tabAssistant: 'Assistant',
    tabAlerts: 'Disaster & Weather',
    tabProfile: 'Profile',

    // Assistant Screen
    appTitle: 'Shalik',
    appSubtitle: 'Offline Voice & Vision Farm Assistant',
    newChat: '+ New',
    offlineActive: '🟢 100% Offline Mode Active',
    emergencyHotline: 'Emergency: 16123',
    imageAttached: '📷 Leaf photo attached',
    removeImage: '✕ Remove',
    quickQuestionsHeader: 'Common Farmer Inquiries:',
    suggestions: [
      'Brown spots on rice leaves, what should I do?',
      'What is the correct schedule for urea fertilizer in Boro rice?',
      'Symptoms and remedy for potato late blight disease?',
      'How to control brinjal shoot and fruit borer?'
    ],
    shalikAdvice: "Shalik's Advisory",
    listen: '🔊 Listen',
    listening: '🔊 Playing...',
    sourcesPrefix: '📚 Sources: ',
    shalikWriting: 'Shalik is writing...',
    listeningVoice: '🔴 Listening to voice...',
    seconds: 'seconds',
    inputPlaceholder: 'Describe crop issue...',
    voiceDialogTitle: 'Speech transcript recognized:',
    voiceDialogHint: 'Edit text if necessary before submitting.',
    cancel: 'Cancel',
    confirmAndSend: 'Confirm & Send',

    // Alerts Screen
    alertsTitle: 'Disaster & Agro-Climate',
    alertsSubtitle: 'Flood, drought & heatwave advisories',
    noAlertsTitle: 'No Active Hazard Alerts',
    noAlertsSubtitle: 'Weather in your region is currently normal.',
    listenAlert: '🔊 Listen Alert',
    viewActionSteps: 'Tap to view action steps ➔',
    modalAlertTitle: 'Emergency Action Guidance',
    expertStepsHeader: 'Agronomist Action Protocol:',
    understood: 'Understood',
    sourcePrefix: 'Source: ',

    // Profile Screen
    profileTitle: 'Farmer Profile & Settings',
    profileSubtitle: 'Personal details and crop preferences',
    farmerNameLabel: 'Farmer Name:',
    districtLabel: 'District:',
    upazilaLabel: 'Upazila:',
    primaryCropsLabel: 'Primary Crops (comma separated):',
    languageSelectLabel: 'Language Selection:',
    savedSuccess: '✓ Profile updated successfully!',
    saveButton: 'Save Changes',
    offlineSecurityTitle: '🔒 100% Offline & Private',
    offlineSecurityDesc:
      'Shalik operates entirely on-device without sending data to the cloud. Your agricultural data and voice notes remain safe on this phone.'
  }
};
