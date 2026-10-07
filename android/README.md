# android/

The Android app. Scaffolded in **Milestone M1** (see `docs/IMPLEMENTATION_PLAN.md`).

Planned modules:
- `:app`: entry point, navigation, DI setup
- `:core:llm`: LiteRT-LM wrapper, model manager (download / side-load / checksum)
- `:core:data`: Room DB, repositories, settings
- `:feature:assistant`: camera, voice, chat and answer UI, orchestrator
- `:feature:alerts`: sync worker, SMS parser, alert UI

Requirements: Android Studio (latest stable), JDK 17+, minSdk 29, arm64-v8a.
