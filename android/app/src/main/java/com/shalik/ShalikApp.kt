package com.shalik

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class ShalikApp : Application() {
    override fun onCreate() {
        super.onCreate()
    }
}
