# Shalik (শালিক) — React Native & TypeScript Edition

[![React Native](https://img.shields.io/badge/React%20Native-0.74-61DAFB?style=flat&logo=react&logoColor=black)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Offline](https://img.shields.io/badge/Offline-100%25%20On--Device-success)](docs/PRIVACY_POLICY.md)
[![Language](https://img.shields.io/badge/Bangla-Native%20(বাংলা)-E91E63)](data/DATASET_CARD.md)

> **"ফসলের রোগ শনাক্ত ও সমাধান — ইন্টারনেট ছাড়াই আপনার হাতের মুঠোয়"**  
> *(Crop disease diagnosis and trusted remedies — right in your hand without the internet)*

This is the full **React Native & TypeScript** conversion of **Shalik (শালিক)**, ported with 100% feature parity from the native Android Kotlin/Jetpack Compose implementation.

---

## 🌟 Architecture & Features

### 1. Core Data & Domain Layer (`src/core/data/`)
- **Models (`models/`):**
  - `ChatMessage.ts`: Typed user and AI dialogue with support for token streaming and agricultural research citations (`BRRI`, `BARI`, `DAE`).
  - `Alert.ts`: Common Alerting Protocol (CAP) aligned schema with 5 disaster types (`HEAT`, `FLOOD`, `CYCLONE`, `HEAVY_RAIN`, `COLD`) and 4 severity levels (`ADVISORY`, `WATCH`, `WARNING`, `EMERGENCY`).
  - `FarmerProfile.ts`: Offline profile capturing farmer district, upazila, and primary crops (ধান, আলু, ইত্যাদি).
- **Database Layer (`database/`):**
  - `ShalikDatabase.ts`: Reactive SQLite-compatible database with entity-domain mappers and `Flow`-like reactive subscriptions.
  - `ChatDao.ts`, `AlertDao.ts`, `FarmerProfileDao.ts`: Data Access Objects adhering to Room database specifications.
- **Repository Pattern (`repository/`):**
  - `ChatRepository.ts`, `AlertRepository.ts`, `FarmerProfileRepository.ts`.

### 2. Safety & RAG Layer (`src/core/data/safety/`, `src/core/data/rag/`)
- **Pesticide Safety Guardrail (`PesticideSafetyGuard.ts`):**
  - Intercepts government-banned agrochemicals (Paraquat, Endosulfan, Carbofuran, Monocrotophos, DDT) in Bengali and English.
  - Intercepts low-confidence recommendations ($< 0.45$) and redirects farmers to **16123 Krishi Call Center**.
- **Offline RAG Search (`OfflineRetriever.ts`):**
  - Token-scored sub-millisecond retrieval across verified Bengali agricultural corpus (BRRI Rice Knowledge Bank, DAE IPM Guide, BARI Handbook).
- **Field Telemetry (`FieldTelemetryLogger.ts`):**
  - Profiles Time-to-First-Token (TTFT), total latency, tokens generated, peak RAM, and farmer ratings into structured JSONL logs.

### 3. On-Device LLM & Device Adaptation (`src/core/llm/`)
- **Device Capability Detector (`DeviceCapabilityDetector.ts`):**
  - Categorizes hardware into Entry 4GB, Mid 6GB, and High 8GB+ tiers.
  - Dynamically configures context window (512 vs 1024 vs 2048 tokens) and activates low-RAM mode.
- **Model Manager (`ModelManager.ts`):**
  - Verifies SHA-256 integrity checksums and manages local `.litertlm` model weights.
- **LiteRT-LM GenAI Engine (`LiteRtLmEngine.ts`):**
  - Simulates 28 tokens/sec on-device streaming generation with cancellation and prompt templates.

### 4. Multimodal Assistant (`src/features/assistant/`)
- **Prompt Builder (`MultimodalPromptBuilder.ts`):**
  - Automatically identifies the 6 Bengali seasons (গ্রীষ্মকাল, বর্ষাকাল, শরৎকাল, হেমন্তকাল, শীতকাল, বসন্তকাল).
  - Injects active climate warnings, vision classifier tags, and RAG citations.
- **Speech & Audio (`speech/`):**
  - 16kHz PCM audio recorder with Bengali live timer.
  - Direct Bengali Speech-to-Text (`SpeechToText.ts`, `GemmaAudioSpeechToText.ts`).
  - Rural-adapted Bangla Text-to-Speech (`BanglaTextToSpeech.ts`) with punctuation and markdown stripping.
- **Vision Quality Inspector (`ImageQualityChecker.ts`):**
  - Checks leaf photo luminance (too dark $<40$, too bright $>225$) and prompts the farmer with clear Bengali photography advice.
- **Formatters (`BanglaFormatters.ts`):**
  - Formats numerals to Bengali digits ($0 \to \text{০}, 1 \to \text{১}, \dots$).

### 5. Disaster & Weather Alerts (`src/features/alerts/`)
- **Agronomist Action Templates (`AlertActionTemplates.ts`):**
  - Specific, actionable emergency guides for heatwaves, floods, heavy rain, cyclones, and cold waves.
- **SMS Fallback Receiver (`SmsAlertReceiver.ts`):**
  - Parses encrypted broadcast SMS alerts (`SHALIK|<TYPE>|<SEV>|<DISTRICT>|<MSG>|<HMAC>`).
- **Alert Sync (`AlertSyncWorker.ts`):**
  - Background synchronization for signed disaster notices and automatic expiration purging.

### 6. Offline Authentication & RBAC Authorization (`src/core/auth/`)
- **100% Air-Gapped Security (`PinHasher.ts`):**
  - Salted SHA-256 cryptographic PIN hashing implemented in pure TypeScript without cloud dependencies.
  - Strict Bangladeshi mobile number format validation (`013`-`019` prefixes).
- **Multi-Role RBAC System (`models/User.ts`, `AuthManager.ts`):**
  - **🌾 Farmer (`FARMER`)**: Ask crop diagnosis queries, view disaster alerts, manage profile.
  - **🛡️ Extension Officer (`OFFICER` - SAAO)**: Broadcast emergency regional alerts, inspect field telemetry diagnostics.
  - **⚙️ Administrator (`ADMIN`)**: Full system control, promote/manage user roles, review guardrail rules.
- **Seeded Demo Accounts (Available with 1-Tap Quick Login):**
  - **Farmer**: Phone `01711000001` | PIN `1234` (*Karim Mia*)
  - **SAAO Officer**: Phone `01811000002` | PIN `5678` (*Dr. Rafiqul Islam*)
  - **Administrator**: Phone `01911000003` | PIN `9999` (*Agri Admin*)

---

## 🚀 Running the Project

### Prerequisites
- Node.js $\ge 18$
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Test Suite
```bash
npm test
```

### 3. Type Check
```bash
npm run type-check
```

### 4. Low-Resource Web Preview (Vite)
```bash
npm run web
```
Instant launch at `http://localhost:5173/` consuming negligible RAM and CPU.

### 5. Start Mobile Metro Bundler
```bash
npm start
```
