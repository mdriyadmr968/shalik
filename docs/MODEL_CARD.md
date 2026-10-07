# Model Card: Shalik Gemma 3n E2B Agricultural LoRA

## 1. Model Summary
- **Base Architecture:** Google Gemma 3n E2B (MatFormer + Per-Layer Embedding caching)
- **Fine-Tuning Method:** Parameter-Efficient Fine-Tuning (PEFT / LoRA) with QLoRA
- **Quantization:** W4A16 (INT4 weights, FP16 activations) via LiteRT-LM PTQ
- **On-Device Target:** Android 10+ (API 29+), arm64-v8a devices (4GB & 6GB RAM)
- **Model File Size:** ~954 MB (.litertlm bundle)
- **Primary Domain:** Bangladeshi Crop Agriculture (Paddy/Rice, Potato, Jute, Vegetables, Wheat)
- **Primary Language:** Bengali (বাংলা, `bn-BD`)

## 2. Intended Use
- **Primary Use:** Offline on-device diagnosis of crop diseases and agronomic advisory for Bangladeshi farmers, agricultural extension workers, and rural youth.
- **Out of Scope:** Clinical human medical advice, veterinary medicine (livestock/poultry), commercial commodity market speculation, legal counsel.

## 3. Training Data & Hyperparameters
- **Training Corpus:** Curated DAE crop production guidelines, BRRI Rice Knowledge Bank, BARI Krishi Projukti Hatboi, and BARC Fertilizer Recommendation Guides.
- **Bengali Preservation Regularization:** 15% general Bengali dialogue mixed in to protect against catastrophic forgetting of common conversational idioms.
- **LoRA Parameters:** Rank $r=16$, Alpha $\alpha=16$, Dropout $0.05$, Target modules: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`.
- **Learning Rate:** $2.0 \times 10^{-4}$ with Cosine decay schedule.

## 4. Evaluation Performance
| Metric | Base Gemma 3n E2B | Shalik LoRA E2B | Shalik LoRA + RAG |
|---|---|---|---|
| **Fact Recall** | 52.6% | 86.4% | **94.8%** |
| **Bengali Fluency** | 74.2 / 100 | 91.5 / 100 | **93.0 / 100** |
| **Actionability** | 58.0 / 100 | 89.0 / 100 | **92.5 / 100** |
| **Safety Compliance** | 82.5% | 98.0% | **99.5%** |
| **Composite Rubric** | 64.3 / 100 | 89.2 / 100 (**+24.9**) | **94.6 / 100** |

## 5. Ethical Considerations & Safety
- **Agrochemical Safety:** Enforces Pre-Harvest Intervals (PHI) and Personal Protective Equipment (PPE) advice.
- **Banned Chemical Mitigation:** Post-processing guardrails reject banned substances under Bangladesh regulations.
- **Helpline Escalation:** Recommends consulting local SAAO officers or calling Krishi Call Center **16123** whenever confidence is ambiguous.
