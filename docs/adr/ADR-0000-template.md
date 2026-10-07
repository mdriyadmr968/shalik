# ADR-0000: Template

- **Status:** proposed | accepted | superseded by ADR-XXXX
- **Date:** YYYY-MM-DD
- **Milestone:** M0

## Context
What problem are we solving? What constraints apply (RAM, offline, Bangla, licence)?

## Options considered
1. Option A: pros / cons, with benchmark numbers
2. Option B: pros / cons, with benchmark numbers

## Decision
What we chose and why.

## Consequences
What becomes easier or harder. What the fallback is if this fails.

---

Planned ADRs for M0:
- ADR-0001: On-device runtime (LiteRT-LM vs MediaPipe vs llama.cpp)
- ADR-0002: Bangla speech-to-text route (Gemma 3n audio vs whisper.cpp vs Android SpeechRecognizer)
- ADR-0003: Model size (Gemma 3n E2B vs E4B) and minimum supported device
- ADR-0004: Fine-tune → `.litertlm` conversion path
