package com.smartscreenshot.app

import android.app.Application
import com.smartscreenshot.app.storage.TempFileManager
import com.smartscreenshot.app.util.CrashReporter

class SmartScreenshotApp : Application() {
    override fun onCreate() {
        super.onCreate()
        // Installed first so a crash anywhere during startup is still captured.
        CrashReporter.install(this)
        // Any temp screenshot left over from a killed/crashed session is stale; drop it.
        TempFileManager.clearAll(this)
    }
}
