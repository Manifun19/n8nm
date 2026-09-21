package com.smartscreenshot.app.util

import android.graphics.Bitmap
import android.graphics.Matrix
import android.graphics.RectF

object BitmapUtils {

    /** Lossless 90-degree-multiple rotation; recycles neither input nor output. */
    fun rotate(source: Bitmap, degrees: Float): Bitmap {
        val matrix = Matrix().apply { postRotate(degrees) }
        return Bitmap.createBitmap(source, 0, 0, source.width, source.height, matrix, true)
    }

    /** Crops [rect] (in source-bitmap pixel coordinates) out of [source]. */
    fun crop(source: Bitmap, rect: RectF): Bitmap {
        val left = rect.left.coerceIn(0f, source.width.toFloat()).toInt()
        val top = rect.top.coerceIn(0f, source.height.toFloat()).toInt()
        val right = rect.right.coerceIn(0f, source.width.toFloat()).toInt()
        val bottom = rect.bottom.coerceIn(0f, source.height.toFloat()).toInt()
        val width = (right - left).coerceAtLeast(1)
        val height = (bottom - top).coerceAtLeast(1)
        return Bitmap.createBitmap(source, left, top, width, height)
    }

    /** Downsampled copy for smooth on-screen preview only; never used for the saved file. */
    fun downsampleForPreview(source: Bitmap, maxDimension: Int): Bitmap {
        val largestSide = maxOf(source.width, source.height)
        if (largestSide <= maxDimension) return source
        val scale = maxDimension.toFloat() / largestSide
        val width = (source.width * scale).toInt().coerceAtLeast(1)
        val height = (source.height * scale).toInt().coerceAtLeast(1)
        return Bitmap.createScaledBitmap(source, width, height, true)
    }

    fun safeRecycle(bitmap: Bitmap?) {
        if (bitmap != null && !bitmap.isRecycled) {
            bitmap.recycle()
        }
    }
}
