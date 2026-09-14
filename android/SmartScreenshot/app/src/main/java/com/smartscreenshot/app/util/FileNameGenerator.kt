package com.smartscreenshot.app.util

import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object FileNameGenerator {

    private const val PATTERN = "yyyyMMdd_HHmmss"

    /** Returns a base name like "Screenshot_20260913_183025" (no extension). */
    fun defaultName(): String {
        val timestamp = SimpleDateFormat(PATTERN, Locale.US).format(Date())
        return "Screenshot_$timestamp"
    }

    /** Strips characters that are unsafe for file systems / MediaStore display names. */
    fun sanitize(name: String): String {
        val trimmed = name.trim().ifEmpty { defaultName() }
        return trimmed.replace(Regex("[\\\\/:*?\"<>|]"), "_")
    }
}
