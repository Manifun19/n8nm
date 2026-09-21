package com.smartscreenshot.app.capture

import android.content.Context
import android.content.Intent
import android.media.projection.MediaProjectionManager
import android.os.Bundle
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity

/**
 * Invisible, no-UI activity whose only job is to host the one-time system
 * "Start recording or casting?" consent dialog Android requires before any
 * screen-capture API can be used. It never becomes visible itself.
 */
class MediaProjectionPermissionActivity : AppCompatActivity() {

    private val launcher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        CaptureRequestBridge.pendingCallback?.invoke(result.resultCode, result.data)
        CaptureRequestBridge.pendingCallback = null
        finish()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val projectionManager =
            getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
        launcher.launch(projectionManager.createScreenCaptureIntent())
    }

    companion object {
        fun start(context: Context) {
            val intent = Intent(context, MediaProjectionPermissionActivity::class.java).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        }
    }
}
