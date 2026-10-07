# ADR-0004: LoRA Export and LiteRT-LM Conversion Pipeline

- **Status:** Accepted
- **Date:** 2026-10-07
- **Milestone:** M0

## Context
Standard Hugging Face / PyTorch LoRA adapter weights cannot be executed directly on Android edge devices. They must be merged with the base model, converted into an optimized computational graph, quantized, and packaged into Google LiteRT-LM's format (`.litertlm`).

## Pipeline Architecture

```
[PyTorch Base Gemma 3n] + [PEFT LoRA Adapters (Text + Vision)]
                          │
                          ▼
            [Weight Merge & Unload (FP16)]
                          │
                          ▼
             [ai-edge-torch Graph Export]
                          │
                          ▼
       [LiteRT-LM PTQ Quantization (W4A16)]
       [Per-Layer Embedding (PLE) Externalization]
                          │
                          ▼
            [Final Artifact: .litertlm]
```

## Fallback Strategy (Dual-Track Safety)
Because edge multimodal model compilers can occasionally run into unsupported tensor operations during cutting-edge updates:
- **Track 1 (Primary):** `ai-edge-torch` / `litert-torch` producing `.litertlm` bundles for Android LiteRT-LM.
- **Track 2 (Documented Fallback):** `llama.cpp` producing GGUF int4 bundles executable on Android via our lightweight JNI bridge (`export_gguf.py`).

## Acceptance Criteria
- Quantization accuracy drop must not exceed 3.0 rubric points on the `eval/text_qa_bn.jsonl` benchmark compared to unquantized FP16 weights.
- On-device package size must stay under 1.2 GB on disk for the E2B variant.
