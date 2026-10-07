# ADR-0001: On-Device LLM Runtime Selection

- **Status:** Accepted
- **Date:** 2026-10-07
- **Milestone:** M0

## Context
Shalik requires executing a generative multimodal model (Gemma 3n) completely offline on resource-constrained Android smartphones (6GB RAM reference, 4GB RAM stretch goal). We evaluated three candidate execution runtimes:
1. **Google LiteRT-LM (`com.google.ai.edge.litert:litert-genai`)**
2. **MediaPipe Tasks LLM Inference API**
3. **llama.cpp via native Android NDK / JNI**

## Options Considered

### Option 1: LiteRT-LM (Chosen)
- **Pros:**
  - Official, production-grade runtime for Gemma models on Android in 2026.
  - Native support for Gemma 3n architectures including MatFormer and Per-Layer Embedding (PLE) weight caching.
  - Optimized hardware acceleration paths for Android NPU, GPU (OpenCL/Vulkan), and CPU.
  - Integrated KV-cache management with low memory overhead (< 260 MB for 1024 tokens).
- **Cons:**
  - Strict model package format requirements (`.litertlm`).

### Option 2: MediaPipe LLM Inference API
- **Pros:**
  - High-level Android SDK with simple setup.
- **Cons:**
  - Primarily designed for standard text-only LLMs (`.task` bundles); multimodal audio ingestion pipeline is less flexible than LiteRT-LM.

### Option 3: llama.cpp via JNI
- **Pros:**
  - Extensive community support, simple GGUF format, broad hardware compatibility.
- **Cons:**
  - Requires maintaining custom C++ JNI bridge bindings.
  - Higher battery consumption on mobile GPUs compared to vendor-tuned LiteRT delegates.

## Decision
Adopt **LiteRT-LM** as the primary runtime for Shalik on Android.

## Consequences & Mitigations
- All fine-tuned models must be converted to `.litertlm` using `ai-edge-torch` / `litert-torch`.
- If a custom model architecture encounters conversion issues, we maintain a modular JNI interface enabling a drop-in fallback to **llama.cpp / GGUF** (see ADR-0004).
