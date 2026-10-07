# Shalik (শালিক)

**An offline farm assistant for Bangladeshi farmers, on a phone.**

Take a photo of a crop problem, ask about it by voice in Bangla, and get a spoken answer. No internet needed.

- 📷 **See**: on-device crop disease recognition (classifier + Gemma 3n vision)
- 🎙️ **Hear**: Bangla voice questions, transcribed on the device
- 🧠 **Know**: Gemma 3n LoRA fine-tuned on Bangladeshi agricultural extension material (DAE, BRRI, BARI), with offline retrieval and cited sources
- 🔊 **Speak**: answers read aloud in Bangla
- ⚠️ **Warn**: heat and flood alerts (from the Idea #3 alert service), delivered by opportunistic sync or SMS

> Named after the শালিক (myna), the talkative bird found in every paddy field. It eats pests.

## Status
🚧 Planning, Milestone **M0** (foundations and feasibility spikes).

See the full plan: [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md)

## Repository layout

| Folder | Purpose |
|---|---|
| `android/` | Android app (Kotlin, Jetpack Compose, LiteRT-LM) |
| `ml/` | Fine-tuning, classifier training, conversion, evaluation |
| `data/` | Datasets (git-ignored; versioned with DVC/HF Datasets) |
| `knowledge/` | Extension material manifest, chunking, offline index build |
| `alerts/` | Alert schema and contract with the Idea #3 alert service |
| `tools/` | Device benchmarking and side-load helper scripts |
| `docs/` | Plan, ADRs, reports |

## Tech stack
Kotlin · Jetpack Compose · LiteRT-LM · Gemma 3n · EmbeddingGemma · SQLite (vector + FTS5) · CameraX · WorkManager · Python · Unsloth · TRL · litert-torch

## Licence
TBD. Model weights are subject to the Gemma Terms of Use. Extension materials remain the property of their publishers.
