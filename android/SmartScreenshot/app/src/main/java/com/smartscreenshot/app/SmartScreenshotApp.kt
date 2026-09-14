package com.smartscreenshot.app

import android.app.Application
import com.smartscreenshot.app.storage.TempFileManager

class SmartScreenshotApp : Application() {
    override fun onCreate() {
        super.onCreate()
        // Any temp screenshot left over from a killed/crashed session is stale; drop it.
        TempFileManager.clearAll(this)
    }
}
