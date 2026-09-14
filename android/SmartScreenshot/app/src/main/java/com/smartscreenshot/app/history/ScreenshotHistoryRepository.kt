package com.smartscreenshot.app.history

import android.content.ContentUris
import android.content.Context
import android.net.Uri
import android.os.Build
import android.provider.MediaStore

/**
 * Lists past Smart Screenshot saves for the history screen. Deliberately has
 * no database of its own: every saved screenshot already lives in MediaStore
 * (written by ScreenshotSaver into the "Smart Screenshot" album), so this
 * just queries that album. Keeps the MVP simple while staying compatible
 * with a real database later if history ever needs data MediaStore doesn't
 * hold (tags, notes, etc.) — only this class and [HistoryItem] would change.
 */
object ScreenshotHistoryRepository {

    private const val ALBUM_RELATIVE_PATH = "Pictures/Smart Screenshot/"
    private const val ALBUM_LEGACY_PATH_FRAGMENT = "/Smart Screenshot/"

    private val projection = arrayOf(
        MediaStore.Images.Media._ID,
        MediaStore.Images.Media.DISPLAY_NAME,
        MediaStore.Images.Media.DATE_ADDED,
        MediaStore.Images.Media.MIME_TYPE
    )

    fun list(context: Context): List<HistoryItem> {
        val collection = MediaStore.Images.Media.EXTERNAL_CONTENT_URI
        val (selection, args) = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            "${MediaStore.Images.Media.RELATIVE_PATH} = ?" to arrayOf(ALBUM_RELATIVE_PATH)
        } else {
            "${MediaStore.Images.Media.DATA} LIKE ?" to arrayOf("%$ALBUM_LEGACY_PATH_FRAGMENT%")
        }
        val sortOrder = "${MediaStore.Images.Media.DATE_ADDED} DESC"

        val items = mutableListOf<HistoryItem>()
        context.contentResolver.query(collection, projection, selection, args, sortOrder)?.use { cursor ->
            val idCol = cursor.getColumnIndexOrThrow(MediaStore.Images.Media._ID)
            val nameCol = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DISPLAY_NAME)
            val dateCol = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATE_ADDED)
            val mimeCol = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.MIME_TYPE)
            while (cursor.moveToNext()) {
                val id = cursor.getLong(idCol)
                val uri = ContentUris.withAppendedId(collection, id)
                items.add(
                    HistoryItem(
                        uri = uri,
                        displayName = cursor.getString(nameCol) ?: "",
                        dateAddedSeconds = cursor.getLong(dateCol),
                        mimeType = cursor.getString(mimeCol) ?: "image/*"
                    )
                )
            }
        }
        return items
    }

    /** Returns true if the row was removed. Our own saved rows are owned by
     *  this app, so no RecoverableSecurityException consent flow is needed. */
    fun delete(context: Context, uri: Uri): Boolean {
        return try {
            context.contentResolver.delete(uri, null, null) > 0
        } catch (t: Throwable) {
            false
        }
    }
}
