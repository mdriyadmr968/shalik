# গোপনীয়তা নীতিমালা (Privacy Policy) — শালিক (Shalik)

**সর্বশেষ সংস্করণ:** সংস্করণ ১.০.০ (অক্টোবর ২০২৬)  
**Last Updated:** Version 1.0.0 (October 2026)

---

## ১. ভূমিকা (বাংলা)

'শালিক' (Shalik) একটি সম্পূর্ণ অফলাইন কৃষি সহকারী অ্যাপ যা বাংলাদেশের প্রত্যন্ত অঞ্চলের কৃষক ও কৃষি উদ্যোক্তাদের জন্য তৈরি। আমাদের মূল দর্শন হলো: **"আপনার ফোনের তথ্য আপনার কাছেই থাকে, ইন্টারনেটে কোনো তথ্য পাঠানো হয় না।"**

### ১.১ ক্যামেরা ও ছবির ব্যবহার (Camera & Photos)
- ফসলের রোগ বা পোকা শনাক্ত করার জন্য তোলা ছবি সম্পূর্ণভাবে আপনার ফোনের প্রসেসর এবং মেমোরির ভেতরেই বিশ্লেষণ করা হয়।
- কোনো ছবি ইন্টারনেটে বা কোনো ক্লাউড সার্ভারে আপলোড করা হয় না।
- আপনি অ্যাপ মুছে দিলে সমস্ত অস্থায়ী ছবি স্বয়ংক্রিয়ভাবে মুছে যায়।

### ১.২ ভয়েস ও মাইক্রোফোন (Voice & Microphone)
- মুখে কথা বলে প্রশ্ন করার সময় অডিও আপনার ফোনের অন-ডিভাইস মডেল দিয়ে সরাসরি বাংলায় রূপান্তর করা হয়।
- কোনো অডিও রেকর্ড ইন্টারনেটে যায় না।

### ১.৩ অবস্থান ও তথ্যভাণ্ডার (Location & Profile)
- আপনার জেলা ও ফসলের তথ্য শুধুমাত্র আবহাওয়ার পূর্বাভাস ও স্থানীয় বালাই ব্যবস্থাপনার সঠিক পরামর্শ দেখানোর জন্য ফোনে সেভ থাকে।

### ১.৪ পরিসংখ্যান ও ফিল্ড পাইলট (Telemetry & Diagnostics)
- অ্যাপের পারফরম্যান্স ও এআই-এর গতি পরীক্ষা সংক্রান্ত তথ্য কেবল আপনার অনুমতি সাপেক্ষে নাম-পরিচয়হীনভাবে ফোনে সংরক্ষিত থাকে। আপনার স্পষ্ট সম্মতি ছাড়া কোনো গবেষক বা প্রতিষ্ঠানে এই তথ্য দেওয়া হয় না।

### ১.৫ ঐচ্ছিক ক্লাউড সিঙ্ক এবং জেমিনাই এআই মোড (Optional Cloud Sync & Gemini API)
- **ডিফল্ট আচরণ:** অ্যাপটি বাই-ডিফল্ট ১০০% অফলাইন ও অন-ডিভাইস মোডে কাজ করে।
- **ঐচ্ছিক সুপাবেস (Supabase) সিঙ্ক:** ইন্টারনেট সংযোগ সক্রিয় থাকলে এবং ব্যবহারকারী সম্মতি দিলে আঞ্চলিক দুর্যোগ ও আবহাওয়ার সতর্কতা আপডেট করতে ক্লাউড সিঙ্ক ব্যবহৃত হয়। ব্যবহারকারীর গোপন পিন (PIN) কখনোই ক্লাউডে প্লেইন টেক্সট হিসেবে পাঠানো হয় না; এটি অন-ডিভাইসে SHA-256 সল্টেড হ্যাশিং দিয়ে সুরক্ষিত থাকে।
- **ঐচ্ছিক ক্লাউড এআই (Google Gemini API):** কোনো উন্নত ব্যবহারকারী বা কর্মকর্তা চাইলে নিজস্ব API কী ব্যবহার করে লাইভ ক্লাউড মডেল সক্রিয় করতে পারেন। অফলাইনে থাকলে অ্যাপ স্বয়ংক্রিয়ভাবে অন-ডিভাইস লোকাল মডেলে ফিরে আসে এবং ইন্টারনেটে কোনো কোয়েরি পাঠায় না।

---

## 2. English Version

Shalik is a 100% on-device offline agricultural assistant engineered for rural farming communities in Bangladesh. Our core design principle is **Zero-Cloud Privacy**:

### 2.1 Camera & Imagery
- Crop disease photos are processed exclusively on your phone's NPU/CPU using on-device neural networks (Gemma 3n & EfficientNet-Lite).
- Images never leave the device and are never uploaded to any remote server or external API.

### 2.2 Voice & Audio Input
- Spoken Bengali queries are ingested and transcribed locally on-device in real-time.
- Raw audio waveforms are immediately released after transcription; no audio recordings are transmitted over the internet.

### 2.3 Farm Profile & Location
- Selected districts and crop categories are persisted strictly in the phone's private SQLite sandbox.
- No GPS tracking or fine location coordinates are queried or retained.

### 2.4 Offline Telemetry & Field Research
- Diagnostic logs (latency, token speed, and anonymized satisfaction ratings) remain in the local app sandbox. Data is exported only with the user's voluntary, informed consent for agricultural research.

### 2.5 Optional Cloud Synchronization (Supabase) & Cloud AI (Google Gemini API)
- **Air-Gapped Default:** Shalik defaults strictly to zero-network, local on-device operation.
- **Optional Supabase Cloud Sync:** When network connectivity is available and background synchronization is active, emergency disaster advisories and synchronized messages sync over HTTPS to a secured Supabase PostgreSQL database governed by Row-Level Security (RLS). Secret 4-digit PINs are never transmitted over the wire in plaintext; they are salted and hashed with SHA-256 exclusively on-device.
- **Optional Cloud AI (Google Gemini):** If an administrator or researcher configures an optional `VITE_GEMINI_API_KEY`, live queries may query Google Gemini over encrypted HTTPS for expanded reasoning. When offline or unconfigured, Shalik instantaneously and transparently falls back to the local, offline small language model without sending queries or metadata to the cloud.

---

**যোগাযোগ / Contact:**  
শালিক ওপেন সোর্স প্রজেক্ট (Shalik Open-Source Project)  
GitHub: [https://github.com/mdriyadmr968/shalik](https://github.com/mdriyadmr968/shalik)  
ইমেইল: mdriyadmr968@gmail.com
