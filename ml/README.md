# ml/

| Folder | Milestone | Contents |
|---|---|---|
| `finetune/` | M4 | Unsloth + TRL LoRA training (text, vision, optional audio), YAML configs |
| `classifier/` | M4 | EfficientNet-Lite / MobileNetV3 disease classifier → LiteRT int8 |
| `convert/` | M0 (spike D), M4 | Merge LoRA → litert-torch → quantize → `.litertlm` |
| `eval/` | M0, M4, M5 | Eval harness: ASR CER/WER, vision accuracy, QA rubric, safety red-team |

Large outputs (checkpoints, `.litertlm`, `.tflite`) are git-ignored. Publish them to the Hugging Face Hub or as release assets.
