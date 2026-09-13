package com.smartscreenshot.app.capture

import android.content.Context
import android.graphics.Bitmap
import android.hardware.display.DisplayManager
import android.hardware.display.VirtualDisplay
import android.media.ImageReader
import android.media.projection.MediaProjection
import android.os.Handler
import android.os.HandlerThread
import android.os.Looper
import android.util.DisplayMetrics

/**
 * Grabs a single, full-resolution frame of the current display using
 * MediaProjection — the only public, non-root Android API able to see what's
 * actually on screen, including content from other apps. The projection
 * token is kept alive by the caller so repeat captures don't need to
 * re-prompt the user.
 */
class ScreenCaptureManager(
    private val context: Context,
    private val mediaProjection: MediaProjection
) {

    private var imageReader: ImageReader? = null
    private var virtualDisplay: VirtualDisplay? = null
    private var handlerThread: HandlerThread? = null

    fun captureFrame(onCaptured: (Bitmap?) -> Unit) {
        val metrics = DisplayMetrics()
        val windowManager = context.getSystemService(Context.WINDOW_SERVICE) as android.view.WindowManager
        @Suppress("DEPRECATION")
        windowManager.defaultDisplay.getRealMetrics(metrics)
        val width = metrics.widthPixels
        val height = metrics.heightPixels
        val density = metrics.densityDpi

        val thread = HandlerThread("SmartScreenshotCapture").apply { start() }
        handlerThread = thread
        val handler = Handler(thread.looper)

        val reader = ImageReader.newInstance(width, height, android.graphics.PixelFormat.RGBA_8888, 2)
        imageReader = reader

        var delivered = false

        fun deliver(bitmap: Bitmap?) {
            if (delivered) return
            delivered = true
            release()
            Handler(Looper.getMainLooper()).post { onCaptured(bitmap) }
        }

        reader.setOnImageAvailableListener({ r ->
            val image = try {
                r.acquireLatestImage()
            } catch (t: Throwable) {
                null
            }
            if (image == null) return@setOnImageAvailableListener
            val bitmap = try {
                imageToBitmap(image, width, height)
            } catch (t: Throwable) {
                null
            } finally {
                image.close()
            }
            deliver(bitmap)
        }, handler)

        virtualDisplay = mediaProjection.createVirtualDisplay(
            "SmartScreenshotCapture",
            width,
            height,
            density,
            DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,
            reader.surface,
            null,
            handler
        )

        // Safety net: if no frame arrives (e.g. display went idle), fail cleanly.
        handler.postDelayed({ deliver(null) }, 2000)
    }

    private fun imageToBitmap(image: android.media.Image, width: Int, height: Int): Bitmap {
        val plane = image.planes[0]
        val buffer = plane.buffer
        val pixelStride = plane.pixelStride
        val rowStride = plane.rowStride
        val rowPadding = rowStride - pixelStride * width

        val rawBitmap = Bitmap.createBitmap(
            width + rowPadding / pixelStride,
            height,
            Bitmap.Config.ARGB_8888
        )
        rawBitmap.copyPixelsFromBuffer(buffer)

        return if (rowPadding == 0) {
            rawBitmap
        } else {
            val trimmed = Bitmap.createBitmap(rawBitmap, 0, 0, width, height)
            rawBitmap.recycle()
            trimmed
        }
    }

    fun release() {
        virtualDisplay?.release()
        virtualDisplay = null
        imageReader?.close()
        imageReader = null
        handlerThread?.quitSafely()
        handlerThread = null
    }
}
