package com.smartscreenshot.app.storage

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import java.io.File
import java.io.FileOutputStream

/**
 * Owns the app's private cache folder for in-flight screenshots (captured →
 * cropping → saved/discarded). Nothing here is user-visible until [ScreenshotSaver]
 * writes the final image to MediaStore, so this directory is safe to wipe anytime.
 */
object TempFileManager {

    private const val DIR_NAME = "smart_screenshot"

    private fun dir(context: Context): File =
        File(context.cacheDir, DIR_NAME).apply { mkdirs() }

    fun writeCapture(context: Context, bitmap: Bitmap): File {
        val file = File(dir(context), "capture_${System.currentTimeMillis()}.png")
        FileOutputStream(file).use { out ->
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
        }
        return file
    }

    fun readBitmap(file: File): Bitmap? =
        if (file.exists()) BitmapFactory.decodeFile(file.absolutePath) else null

    fun delete(file: File?) {
        if (file != null && file.exists()) {
            file.delete()
        }
    }

    /** Clears any leftover temp screenshots from previous, possibly-crashed sessions. */
    fun clearAll(context: Context) {
        dir(context).listFiles()?.forEach { it.delete() }
    }
}
