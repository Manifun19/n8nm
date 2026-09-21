package com.smartscreenshot.app.history

import android.net.Uri

data class HistoryItem(
    val uri: Uri,
    val displayName: String,
    val dateAddedSeconds: Long,
    val mimeType: String
)
