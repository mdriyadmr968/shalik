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

  // Authentication & RBAC Management
  tabAdmin: string;
  authTitle: string;
  authSubtitle: string;
  loginTab: string;
  registerTab: string;
  phoneLabel: string;
  phonePlaceholder: string;
  pinLabel: string;
  pinPlaceholder: string;
  nameLabel: string;
  namePlaceholder: string;
  roleLabel: string;
  roleFarmer: string;
  roleOfficer: string;
  roleAdmin: string;
  loginButton: string;
  registerButton: string;
  quickDemoLogin: string;
  logoutButton: string;
  currentRolePrefix: string;
  managementTitle: string;
  broadcastAlertTitle: string;
  broadcastAlertDesc: string;
  alertMessageBn: string;
  alertMessageEn: string;
  alertSeverity: string;
  broadcastButton: string;
  telemetryTitle: string;
  telemetryDesc: string;
  userManagementTitle: string;
  changeRole: string;
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
      'শালিক-এ আপনার কোনো তথ্য ক্লাউড বা ইন্টারনেটে পাঠানো হয় না। আপনার সমস্ত তথ্য এই ফোনে সুরক্ষিতভাবে সংরক্ষিত থাকে।',

    // Authentication & RBAC Management
    tabAdmin: 'অফিসার প্যানেল',
    authTitle: 'শালিক একাউন্ট',
    authSubtitle: 'অফলাইন মোবাইল নম্বর ও ৪ ডিজিটের পিন',
    loginTab: 'লগইন',
    registerTab: 'নতুন নিবন্ধন',
    phoneLabel: 'মোবাইল নম্বর:',
    phonePlaceholder: 'যেমন: 01711000001',
    pinLabel: '৪ ডিজিটের গোপন পিন:',
    pinPlaceholder: '••••',
    nameLabel: 'আপনার পুরো নাম:',
    namePlaceholder: 'যেমন: করিম মিয়া',
    roleLabel: 'ভূমিকা / পদবি (Role):',
    roleFarmer: '🌾 কৃষক',
    roleOfficer: '🛡️ উপ-সহকারী কৃষি কর্মকর্তা (SAAO)',
    roleAdmin: '⚙️ সিস্টেম প্রশাসক',
    loginButton: 'প্রবেশ করুন',
    registerButton: 'একাউন্ট খুলুন',
    quickDemoLogin: '⚡ দ্রুত ডেমো লগইন (১-ট্যাপ):',
    logoutButton: '🚪 লগআউট',
    currentRolePrefix: 'বর্তমান পদবি: ',
    managementTitle: 'অফিসার ও অ্যাডমিন কন্ট্রোল রুম',
    broadcastAlertTitle: 'জরুরি কৃষি সতর্কতা প্রচার',
    broadcastAlertDesc: 'এলাকার কৃষকদের জন্য তাৎক্ষণিক সতর্কবার্তা জারি করুন',
    alertMessageBn: 'সতর্কবার্তা (বাংলা):',
    alertMessageEn: 'সতর্কবার্তা (ইংরেজি):',
    alertSeverity: 'সতর্কতার তীব্রতা:',
    broadcastButton: '📢 সতর্কতা প্রচার করুন',
    telemetryTitle: 'ফিল্ড টেলিমেট্রি ও সিস্টেম হেলথ',
    telemetryDesc: 'মডেল প্রতিক্রিয়া সময়, অন-ডিভাইস ভেক্টর ক্যাশ ও নিরাপত্তা গার্ডরেল',
    userManagementTitle: 'ব্যবহারকারী ও রোল নিয়ন্ত্রণ',
    changeRole: 'পদবি পরিবর্তন'
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
      'Shalik operates entirely on-device without sending data to the cloud. Your agricultural data and voice notes remain safe on this phone.',

    // Authentication & RBAC Management
    tabAdmin: 'Officer Panel',
    authTitle: 'Shalik Account',
    authSubtitle: 'Offline Mobile & 4-Digit Secret PIN',
    loginTab: 'Sign In',
    registerTab: 'Register',
    phoneLabel: 'Mobile Number:',
    phonePlaceholder: 'e.g. 01711000001',
    pinLabel: '4-Digit Secret PIN:',
    pinPlaceholder: '••••',
    nameLabel: 'Full Name:',
    namePlaceholder: 'e.g. Karim Mia',
    roleLabel: 'User Role Assignment:',
    roleFarmer: '🌾 Farmer',
    roleOfficer: '🛡️ Agricultural Extension Officer (SAAO)',
    roleAdmin: '⚙️ System Administrator',
    loginButton: 'Sign In',
    registerButton: 'Create Account',
    quickDemoLogin: '⚡ Quick Demo Login (1-Tap):',
    logoutButton: '🚪 Sign Out',
    currentRolePrefix: 'Current Role: ',
    managementTitle: 'Officer & Admin Command Center',
    broadcastAlertTitle: 'Broadcast Emergency Alert',
    broadcastAlertDesc: 'Publish urgent hazard and weather advisories to regional farmers',
    alertMessageBn: 'Alert Message (Bengali):',
    alertMessageEn: 'Alert Message (English):',
    alertSeverity: 'Severity Level:',
    broadcastButton: '📢 Broadcast Advisory',
    telemetryTitle: 'Field Telemetry & Health',
    telemetryDesc: 'Model Latency, On-Device Vector Cache & Guardrail Integrity',
    userManagementTitle: 'User & Role Access Control',
    changeRole: 'Change Role'
  }
};
