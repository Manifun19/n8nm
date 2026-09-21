package com.smartscreenshot.app.util

import android.content.Context
import java.io.File
import java.io.PrintWriter
import java.io.StringWriter

/**
 * Minimal, dependency-free crash capture so a user without ADB/a PC can still
 * report the exact failure: writes the stack trace to a file, then
 * [MainActivity] surfaces it in a copyable dialog on the next launch. Covers
 * the whole app process, including FloatingBubbleService (it runs in the
 * same process, not a separate android:process).
 */
object CrashReporter {
    private const val FILE_NAME = "last_crash.txt"

    fun install(context: Context) {
        val appContext = context.applicationContext
        val previousHandler = Thread.getDefaultUncaughtExceptionHandler()
        Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
            try {
                writeCrash(appContext, throwable)
            } catch (t: Throwable) {
                // Never let crash reporting itself block the real crash handling.
            }
            previousHandler?.uncaughtException(thread, throwable)
        }
    }

    private fun writeCrash(context: Context, throwable: Throwable) {
        val writer = StringWriter()
        throwable.printStackTrace(PrintWriter(writer))
        File(context.filesDir, FILE_NAME).writeText(writer.toString())
    }

    /** Returns the last captured crash (and deletes it), or null if there was none. */
    fun readAndClear(context: Context): String? {
        val file = File(context.filesDir, FILE_NAME)
        if (!file.exists()) return null
        val text = file.readText()
        file.delete()
        return text.ifBlank { null }
    }
}
