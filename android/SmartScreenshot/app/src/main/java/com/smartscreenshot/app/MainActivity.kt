package com.smartscreenshot.app

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.widget.TextView
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.button.MaterialButton
import com.google.android.material.snackbar.Snackbar
import com.smartscreenshot.app.bubble.FloatingBubbleService
import com.smartscreenshot.app.history.HistoryActivity

class MainActivity : AppCompatActivity() {

    private lateinit var toggleButton: MaterialButton
    private lateinit var statusText: TextView

    private val notificationPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
            if (granted) {
                startBubbleIfPermitted()
            } else {
                showMessage(getString(R.string.notification_permission_required))
            }
        }

    private val overlayPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) {
            startBubbleIfPermitted()
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        toggleButton = findViewById(R.id.toggleBubbleButton)
        statusText = findViewById(R.id.statusText)

        toggleButton.setOnClickListener {
            if (FloatingBubbleService.isRunning) {
                FloatingBubbleService.stop(this)
                refreshStatus()
            } else {
                requestPermissionsThenStart()
            }
        }

        findViewById<MaterialButton>(R.id.viewHistoryButton).setOnClickListener {
            startActivity(Intent(this, HistoryActivity::class.java))
        }
    }

    override fun onResume() {
        super.onResume()
        refreshStatus()
    }

    private fun requestPermissionsThenStart() {
        if (!Settings.canDrawOverlays(this)) {
            showMessage(getString(R.string.overlay_permission_required))
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:$packageName")
            )
            overlayPermissionLauncher.launch(intent)
            return
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) !=
            android.content.pm.PackageManager.PERMISSION_GRANTED
        ) {
            notificationPermissionLauncher.launch(android.Manifest.permission.POST_NOTIFICATIONS)
            return
        }
        startBubbleIfPermitted()
    }

    private fun startBubbleIfPermitted() {
        if (!Settings.canDrawOverlays(this)) return
        FloatingBubbleService.start(this)
        refreshStatus()
    }

    private fun refreshStatus() {
        val running = FloatingBubbleService.isRunning
        toggleButton.text = getString(
            if (running) R.string.btn_disable_bubble else R.string.btn_enable_bubble
        )
        statusText.text = ""
    }

    private fun showMessage(message: String) {
        Snackbar.make(findViewById(R.id.toggleBubbleButton), message, Snackbar.LENGTH_LONG).show()
    }
}
