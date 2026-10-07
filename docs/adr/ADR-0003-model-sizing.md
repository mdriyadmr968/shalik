# ADR-0003: Model Sizing and Target Edge Hardware Profile

- **Status:** Accepted
- **Date:** 2026-10-07
- **Milestone:** M0

## Context
In rural Bangladesh, mid-range and entry-level Android smartphones with 4GB to 6GB RAM represent the overwhelming majority of smart devices owned by farming families and village youth. Running on-device generative AI under these tight constraints requires strict memory and thermal budgeting.

## Profile Comparison

| Attribute | Gemma 3n E2B (Chosen Default) | Gemma 3n E4B (High-End Option) |
|---|---|---|
| **Parameters** | ~2 Billion | ~4 Billion |
| **Quantized Weights (W4A16)** | **~954 MB** | ~1.9 GB |
| **KV Cache (1024 tokens)** | ~256 MB | ~480 MB |
| **Peak Runtime RSS** | **~1.56 GB** | ~2.85 GB |
| **4GB Phone Headroom** | **Safe (~1.8 GB free)** | Dangerous (OOM Risk) |
| **6GB Phone Headroom** | **High (>3.2 GB free)** | Safe (~2.1 GB free) |
| **Generation Speed (Mid-range)** | **22–24 tokens/sec** | 10–13 tokens/sec |

## Decision
1. **Primary Model Target:**
   - Standardize on **Gemma 3n E2B (W4A16 INT4 weights, FP16 activations)** as the default model distributed to all users.
2. **Device Qualification at First Launch:**
   - The Shalik Android app inspects total physical RAM (`ActivityManager.getMemoryInfo`).
   - Devices with **< 6GB RAM**: Automatically assigned Gemma 3n E2B with 1024 token context limit.
   - Devices with **≥ 8GB RAM**: Offer optional high-precision package (Gemma 3n E4B) via settings.
