package com.smartscreenshot.app.storage

import android.content.Context
import android.content.Intent
import android.net.Uri
import com.smartscreenshot.app.R

/** Hands a saved screenshot to Android's native share sheet. No custom sharing UI. */
object ShareHelper {

    fun share(context: Context, imageUri: Uri, mimeType: String) {
        val sendIntent = Intent(Intent.ACTION_SEND).apply {
            type = mimeType
            putExtra(Intent.EXTRA_STREAM, imageUri)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        val chooser = Intent.createChooser(sendIntent, context.getString(R.string.share_chooser_title)).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(chooser)
    }
}
