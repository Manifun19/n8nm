package com.smartscreenshot.app.bubble

import android.app.Activity
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.graphics.PixelFormat
import android.media.projection.MediaProjection
import android.media.projection.MediaProjectionManager
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.view.Gravity
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.Toast
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import com.smartscreenshot.app.MainActivity
import com.smartscreenshot.app.R
import com.smartscreenshot.app.capture.CaptureRequestBridge
import com.smartscreenshot.app.capture.MediaProjectionPermissionActivity
import com.smartscreenshot.app.capture.ScreenCaptureManager
import com.smartscreenshot.app.editor.CropEditorActivity
import com.smartscreenshot.app.storage.TempFileManager
import kotlin.math.abs

class FloatingBubbleService : Service() {

    private lateinit var windowManager: WindowManager
    private lateinit var bubbleView: View
    private lateinit var layoutParams: WindowManager.LayoutParams

    private var mediaProjection: MediaProjection? = null
    private var captureManager: ScreenCaptureManager? = null
    private var captureInProgress = false

    private var screenWidth = 0

    override fun onCreate() {
        super.onCreate()
        isRunning = true
        createNotificationChannel()
        startForegroundWithType()
        addBubbleToWindow()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int = START_STICKY

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        isRunning = false
        captureManager?.release()
        mediaProjection?.stop()
        mediaProjection = null
        if (::windowManager.isInitialized && ::bubbleView.isInitialized) {
            runCatching { windowManager.removeView(bubbleView) }
        }
    }

    // ---- Overlay bubble setup -------------------------------------------------

    private fun addBubbleToWindow() {
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        val displayMetrics = resources.displayMetrics
        screenWidth = displayMetrics.widthPixels

        bubbleView = LayoutInflater.from(this).inflate(R.layout.layout_bubble, null)

        val overlayType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        layoutParams = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            overlayType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = screenWidth
            y = displayMetrics.heightPixels / 3
        }

        windowManager.addView(bubbleView, layoutParams)
        attachTouchHandling()
    }

    private fun attachTouchHandling() {
        var initialX = 0
        var initialY = 0
        var initialTouchX = 0f
        var initialTouchY = 0f
        var downTime = 0L
        var dragging = false
        val tapSlop = 12
        val tapTimeoutMs = 250L

        bubbleView.setOnTouchListener { _, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    initialX = layoutParams.x
                    initialY = layoutParams.y
                    initialTouchX = event.rawX
                    initialTouchY = event.rawY
                    downTime = System.currentTimeMillis()
                    dragging = false
                    true
                }
                MotionEvent.ACTION_MOVE -> {
                    val dx = (event.rawX - initialTouchX).toInt()
                    val dy = (event.rawY - initialTouchY).toInt()
                    if (!dragging && (abs(dx) > tapSlop || abs(dy) > tapSlop)) {
                        dragging = true
                    }
                    if (dragging) {
                        layoutParams.x = initialX + dx
                        layoutParams.y = initialY + dy
                        runCatching { windowManager.updateViewLayout(bubbleView, layoutParams) }
                    }
                    true
                }
                MotionEvent.ACTION_UP -> {
                    val elapsed = System.currentTimeMillis() - downTime
                    if (!dragging && elapsed < tapTimeoutMs) {
                        onBubbleTapped()
                    } else if (dragging) {
                        snapToNearestEdge()
                    }
                    true
                }
                else -> false
            }
        }
    }

    private fun snapToNearestEdge() {
        val bubbleWidth = bubbleView.width.takeIf { it > 0 } ?: 80
        val targetX = if (layoutParams.x + bubbleWidth / 2 < screenWidth / 2) 0 else screenWidth - bubbleWidth
        layoutParams.x = targetX
        runCatching { windowManager.updateViewLayout(bubbleView, layoutParams) }
    }

    // ---- Capture ---------------------------------------------------------------

    private fun onBubbleTapped() {
        if (captureInProgress) return
        captureInProgress = true

        val existingProjection = mediaProjection
        if (existingProjection != null) {
            performCapture(existingProjection)
            return
        }

        CaptureRequestBridge.pendingCallback = { resultCode, data ->
            if (resultCode == Activity.RESULT_OK && data != null) {
                val manager = getSystemService(MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
                val projection = manager.getMediaProjection(resultCode, data)
                mediaProjection = projection
                if (projection != null) {
                    projection.registerCallback(object : MediaProjection.Callback() {
                        override fun onStop() {
                            // Revoked by the user via system UI; next tap must re-prompt.
                            captureManager?.release()
                            captureManager = null
                            mediaProjection = null
                        }
                    }, Handler(Looper.getMainLooper()))
                    performCapture(projection)
                } else {
                    onCaptureFailed()
                }
            } else {
                captureInProgress = false
                Handler(Looper.getMainLooper()).post {
                    Toast.makeText(this, R.string.capture_permission_denied, Toast.LENGTH_SHORT).show()
                }
            }
        }
        MediaProjectionPermissionActivity.start(this)
    }

    private fun performCapture(projection: MediaProjection) {
        // Hide the bubble and let two layout/draw passes complete before the
        // frame is grabbed, so the bubble itself never appears in the shot.
        bubbleView.visibility = View.INVISIBLE
        bubbleView.post {
            bubbleView.post {
                val manager = captureManager ?: ScreenCaptureManager(this, projection).also { captureManager = it }
                manager.captureFrame { bitmap ->
                    bubbleView.visibility = View.VISIBLE
                    captureInProgress = false
                    if (bitmap != null) {
                        val file = TempFileManager.writeCapture(this, bitmap)
                        bitmap.recycle()
                        CropEditorActivity.start(this, file.absolutePath)
                    } else {
                        onCaptureFailed()
                    }
                }
            }
        }
    }

    private fun onCaptureFailed() {
        bubbleView.visibility = View.VISIBLE
        captureInProgress = false
        Toast.makeText(this, R.string.capture_failed, Toast.LENGTH_SHORT).show()
    }

    // ---- Foreground service notification ---------------------------------------

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                getString(R.string.notification_channel_name),
                NotificationManager.IMPORTANCE_MIN
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun startForegroundWithType() {
        val openAppIntent = PendingIntent.getActivity(
            this, 0, Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE
        )
        val notification: Notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_bubble_camera)
            .setContentTitle(getString(R.string.notification_title))
            .setContentText(getString(R.string.notification_text))
            .setContentIntent(openAppIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_MIN)
            .build()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ServiceCompat.startForeground(
                this,
                NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PROJECTION
            )
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
    }

    companion object {
        private const val CHANNEL_ID = "smart_screenshot_bubble"
        private const val NOTIFICATION_ID = 4201

        @Volatile
        var isRunning: Boolean = false
            private set

        fun start(context: Context) {
            val intent = Intent(context, FloatingBubbleService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        fun stop(context: Context) {
            context.stopService(Intent(context, FloatingBubbleService::class.java))
        }
    }
}
