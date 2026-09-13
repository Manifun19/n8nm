package com.smartscreenshot.app.capture

import android.content.Intent

/**
 * A Service cannot call startActivityForResult itself, so the one-time
 * MediaProjection consent dialog is hosted by the transparent
 * [MediaProjectionPermissionActivity] instead. This in-process bridge carries
 * that activity's result back to whichever caller (the bubble service)
 * requested it.
 */
object CaptureRequestBridge {
    var pendingCallback: ((resultCode: Int, data: Intent?) -> Unit)? = null
}
