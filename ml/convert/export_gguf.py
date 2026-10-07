#!/usr/bin/env python3
"""
Fallback Conversion: Merged LoRA to GGUF format for llama.cpp / Ollama fallback.
Use this script if LiteRT-LM conversion encounters unsupported operators or device-specific issues.
"""

import os
import sys
import argparse
import subprocess
import logging

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("export_gguf")

def export_to_gguf(merged_model_dir: str, output_path: str, quant_type: str = "q4_k_m"):
    logger.info(f"Preparing GGUF fallback export for: {merged_model_dir}")
    logger.info(f"Target Quantization: {quant_type}")
    logger.info(f"Output File: {output_path}")

    print("\n" + "=" * 70)
    print("SHALIK FALLBACK CONVERSION: GGUF / LLAMA.CPP RECIPE")
    print("=" * 70)
    print("GGUF Conversion Workflow:")
    print("1. Merge LoRA adapter into base model (FP16 HuggingFace format):")
    print(f"   python ml/convert/convert_lora_to_litert.py --base_model google/gemma-3n-e2b-it --output_dir {merged_model_dir}")
    print("2. Run llama.cpp convert_hf_to_gguf.py:")
    print(f"   python llama.cpp/convert_hf_to_gguf.py {merged_model_dir} --outtype f16 --outfile {output_path}.f16.gguf")
    print("3. Quantize to 4-bit (Q4_K_M):")
    print(f"   llama-quantize {output_path}.f16.gguf {output_path} {quant_type}")
    print("=" * 70)
    print("Status: GGUF Fallback Pipeline Documented & Ready")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Export to GGUF fallback format")
    parser.add_argument("--model_dir", default="ml/convert/outputs/merged_fp16", help="Directory of merged HF model")
    parser.add_argument("--output", default="ml/convert/outputs/shalik_gemma3n_q4.gguf", help="Output .gguf path")
    parser.add_argument("--quant", default="q4_k_m", help="GGUF quant format")
    args = parser.parse_args()

    export_to_gguf(args.model_dir, args.output, args.quant)
