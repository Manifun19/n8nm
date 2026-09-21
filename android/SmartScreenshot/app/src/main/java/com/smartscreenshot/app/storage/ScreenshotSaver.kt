package com.smartscreenshot.app.storage

import android.content.ContentValues
import android.content.Context
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import java.io.File
import java.io.FileOutputStream
import java.io.OutputStream

enum class ImageFormat(val extension: String, val mimeType: String, val compressFormat: Bitmap.CompressFormat) {
    PNG("png", "image/png", Bitmap.CompressFormat.PNG),
    JPG("jpg", "image/jpeg", Bitmap.CompressFormat.JPEG)
}

/**
 * Saves the final cropped screenshot into the device's public Pictures/Gallery
 * storage. Uses MediaStore (scoped storage) on Android 10+ and falls back to
 * the legacy public-directory + media-scan approach on older versions.
 */
object ScreenshotSaver {

    private const val RELATIVE_DIR = "Pictures/Smart Screenshot"
    private const val JPEG_QUALITY = 92

    sealed class Result {
        data class Success(val uri: Uri) : Result()
        data class Failure(val error: Throwable) : Result()
    }

    fun save(context: Context, bitmap: Bitmap, baseName: String, format: ImageFormat): Result {
        return try {
            val uri = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                saveWithMediaStore(context, bitmap, baseName, format)
            } else {
                saveLegacy(context, bitmap, baseName, format)
            } ?: return Result.Failure(IllegalStateException("MediaStore returned no Uri"))
            Result.Success(uri)
        } catch (t: Throwable) {
            Result.Failure(t)
        }
    }

    private fun saveWithMediaStore(context: Context, bitmap: Bitmap, baseName: String, format: ImageFormat): Uri? {
        val resolver = context.contentResolver
        val values = ContentValues().apply {
            put(MediaStore.Images.Media.DISPLAY_NAME, "$baseName.${format.extension}")
            put(MediaStore.Images.Media.MIME_TYPE, format.mimeType)
            put(MediaStore.Images.Media.RELATIVE_PATH, RELATIVE_DIR)
            put(MediaStore.Images.Media.IS_PENDING, 1)
        }
        val collection = MediaStore.Images.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
        val itemUri = resolver.insert(collection, values) ?: return null

        resolver.openOutputStream(itemUri)?.use { out ->
            writeBitmap(bitmap, format, out)
        } ?: run {
            resolver.delete(itemUri, null, null)
            return null
        }

        values.clear()
        values.put(MediaStore.Images.Media.IS_PENDING, 0)
        resolver.update(itemUri, values, null, null)
        return itemUri
    }

    private fun saveLegacy(context: Context, bitmap: Bitmap, baseName: String, format: ImageFormat): Uri? {
        val picturesDir = File(
            Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES),
            "Smart Screenshot"
        ).apply { mkdirs() }

        val file = File(picturesDir, "$baseName.${format.extension}")
        FileOutputStream(file).use { out -> writeBitmap(bitmap, format, out) }

        val values = ContentValues().apply {
            put(MediaStore.Images.Media.DISPLAY_NAME, file.name)
            put(MediaStore.Images.Media.MIME_TYPE, format.mimeType)
            put(MediaStore.Images.Media.DATA, file.absolutePath)
        }
        val collection = MediaStore.Images.Media.EXTERNAL_CONTENT_URI
        return context.contentResolver.insert(collection, values)
    }

    private fun writeBitmap(bitmap: Bitmap, format: ImageFormat, out: OutputStream) {
        val quality = if (format == ImageFormat.JPG) JPEG_QUALITY else 100
        bitmap.compress(format.compressFormat, quality, out)
    }
}
