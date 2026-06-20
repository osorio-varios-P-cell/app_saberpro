# SaberPro ProGuard Rules
# WebView app — mantener clases WebView
-keep class androidx.webkit.** { *; }
-keep class android.webkit.** { *; }
-dontwarn android.webkit.**
