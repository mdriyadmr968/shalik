# Shalik Android ProGuard / R8 Rules for Release Build

# Room SQLite entities & DAOs
-keep class androidx.room.** { *; }
-dontwarn androidx.room.**
-keep class * extends androidx.room.RoomDatabase
-keep @androidx.room.Entity class * { *; }
-keep @androidx.room.Dao class * { *; }

# Google LiteRT / LiteRT-LM native binaries and JNI bindings
-keep class com.google.ai.edge.litert.** { *; }
-dontwarn com.google.ai.edge.litert.**
-keepclasseswithmembernames class * {
    native <methods>;
}

# Dagger / Hilt Dependency Injection
-keep class * extends dagger.hilt.internal.UnsafeCasts { *; }
-keep class dagger.hilt.** { *; }
-dontwarn dagger.hilt.**

# Kotlin Coroutines & Flow
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler {}
-keepclassmembers class kotlinx.coroutines.** {
    volatile <fields>;
}

# Shalik Domain & Telemetry Models
-keep class com.shalik.core.data.model.** { *; }
-keep class com.shalik.feature.alerts.model.** { *; }
-keep class com.shalik.core.data.telemetry.** { *; }
