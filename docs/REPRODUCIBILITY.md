# Reproducibility Guide: Shalik Training, Quantization & Evaluation

This guide describes how to replicate the end-to-end model development, LoRA fine-tuning, knowledge indexing, and evaluation pipeline for **Shalik (শালিক)**.

---

## 1. Environment Setup

### 1.1 Python Virtual Environment
```bash
python -m venv .venv
# On Windows
.venv\Scripts\activate
# On Linux/macOS
source .venv/bin/activate

pip install -r ml/requirements.txt
```

### 1.2 Android Development Setup
- Android Studio Iguana / Jellyfish (latest stable)
- JDK 17 (Temurin or OpenJDK)
- Android SDK Platforms 34, Build Tools 34.0.0, NDK r26c
- Target ABI: `arm64-v8a` only

---

## 2. Dataset Pipeline Reproduction

1. **Clean & Chunk Agricultural Extension Corpus:**
   ```bash
   python knowledge/clean_and_chunk.py
   ```
   Converts Bijoy-encoded PDFs into Unicode NFC Bengali and creates semantic 300–500 token chunks in `knowledge/build/processed_chunks.jsonl`.

2. **Generate SFT Dialogue Dataset:**
   ```bash
   python ml/dataset_generators/build_sft_dataset.py
   ```
   Outputs formatted ShareGPT JSONL training samples with multi-turn dialogues and negative referral handling.

3. **Build Offline SQLite RAG Index:**
   ```bash
   python knowledge/build_index.py --chunks knowledge/build/processed_chunks.jsonl --output knowledge/build/kb-v1.sqlite
   ```

---

## 3. Fine-Tuning & Quantization

1. **LoRA Fine-Tuning (Gemma 3n):**
   ```bash
   python ml/finetune/train_lora.py --config ml/finetune/finetune_config.yaml
   ```
   Uses Unsloth with TRL `SFTTrainer` (r=16, alpha=16, 4-bit QLoRA) preserving 15% general Bengali fluency.

2. **Crop Disease Classifier Training:**
   ```bash
   python ml/classifier/train_classifier.py --config ml/classifier/classifier_config.yaml
   ```
   Trains an EfficientNet-Lite0 int8 model for 12 major crop diseases with field augmentation.

3. **Export & Quantization to LiteRT-LM:**
   ```bash
   python ml/convert/convert_lora_to_litert.py --model-dir ml/finetune/output/checkpoint-final --output ml/convert/gemma-3n-e2b-it-w4a16.litertlm
   ```

---

## 4. Evaluation Harness & Verification Suite

Execute the full milestone verification battery:

| Milestone / Area | Test Command | Output Metrics |
|---|---|---|
| **M0 Foundations** | `python ml/eval/spike_a_speech.py`<br>`python ml/eval/spike_b_generation.py`<br>`python ml/eval/spike_c_vision.py` | CER/WER, Fact recall, Top-1 accuracy |
| **M4 Fine-Tuning** | `python ml/eval/evaluate_model_rubric.py` | +24.9 rubric points gain over base Gemma 3n |
| **M5 RAG & Safety** | `python ml/eval/evaluate_m5_rag_safety.py` | 0.33 ms retrieval latency, 100% banned chemical blocks |
| **M6 Climate Alerts** | `python ml/eval/evaluate_m6_alerts.py` | CAP schema validation, SMS HMAC parsing |
| **M7 Field Pilot** | `python tools/field_pilot_test.py` | 93.3% task success, 2.3s TTFT, 2.1 GB RAM |

---

## 5. Offline Packaging & Release Build

To produce the offline distribution bundle:
```bash
python tools/package_offline_kit.py
```
This packages the release APK, LiteRT model, SQLite knowledge base, cryptographic `SHA256SUMS.txt`, and installation manuals into `dist/shalik-v1.0.0-offline-kit.zip`.
