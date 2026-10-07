# ADR-0002: Bangla Speech-to-Text Route Selection

- **Status:** Accepted
- **Date:** 2026-10-07
- **Milestone:** M0

## Context
Rural Bangladeshi farmers speak diverse regional dialects (Rangpur, Rajshahi, Barisal, Sylhet, Chittagong) often with background field noises (pumps, tractors, wind). Farmers in low-literacy segments prefer voice questions over on-screen typing. We evaluated three offline ASR candidates:
1. **Gemma 3n Native Audio Ingestion (LiteRT-LM)**
2. **Whisper-Small Bengali fine-tune via whisper.cpp (int4)**
3. **Android Platform Offline `SpeechRecognizer` (bn-BD)**

## Empirical Findings (Spike A Benchmark on 30 Farmer Queries)

| Candidate Engine | Overall CER | Overall WER | Added Model Size | Added RAM | Latency (10s audio) |
|---|---|---|---|---|---|
| **Whisper-Small Bengali (whisper.cpp int4)** | **12.8%** | **22.2%** | 142 MB | 340 MB | 2.1s |
| **Gemma 3n Native Audio (LiteRT-LM)** | **16.9%** | **27.6%** | **0 MB (Shared)** | **0 MB (Shared)** | **1.4s** |
| **Android OS Offline SpeechRecognizer** | 37.6% | 57.0% | 65 MB | 110 MB | 0.8s |

## Key Insights
1. **Android OS Offline SpeechRecognizer** fails to handle regional farming vocabulary and non-standard dialects (CER > 37%, WER > 57%). It is rejected for core agricultural use.
2. **Whisper-Small Bengali** has the best phonetic accuracy and dialect robustness. However, running it alongside a 2B LLM demands an additional 340 MB of RAM, bringing 4GB devices dangerously close to the Android Out-Of-Memory (OOM) killer.
3. **Gemma 3n Native Audio Ingestion** provides acceptable CER (16.9%) while sharing the existing multimodal model weights—meaning **zero additional RAM footprint**.

## Decision
Adopt a **Two-Tier Architecture**:
1. **Default Tier (All Devices, especially 4GB-6GB RAM):**
   - Use **Gemma 3n Native Audio Input** via LiteRT-LM.
   - Show the generated Bangla transcript to the user with a 1-tap "Edit / Re-record" button to resolve occasional dialect misrecognitions.
2. **Modular Fallback Tier (High-RAM 8GB+ Devices / Standalone Mode):**
   - Provide an optional standalone **Whisper.cpp (Whisper-Small Bangla)** engine behind the `SpeechToText` interface.
