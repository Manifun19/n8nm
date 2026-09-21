package com.smartscreenshot.app.history

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.View
import android.widget.ImageButton
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.snackbar.Snackbar
import com.smartscreenshot.app.R

/**
 * Basic gallery of past Smart Screenshot saves. Reads straight from
 * MediaStore via [ScreenshotHistoryRepository] — no separate app database —
 * per the MVP scope: saved screenshots already live in the device gallery,
 * this just gives a quick in-app view of that same album.
 */
class HistoryActivity : AppCompatActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var emptyText: TextView
    private lateinit var adapter: HistoryAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_history)

        findViewById<ImageButton>(R.id.historyBackButton).setOnClickListener { finish() }

        recyclerView = findViewById(R.id.historyRecyclerView)
        emptyText = findViewById(R.id.historyEmptyText)

        adapter = HistoryAdapter(
            context = this,
            onClick = { item -> openItem(item) },
            onLongClick = { item -> confirmDelete(item); true }
        )
        recyclerView.layoutManager = GridLayoutManager(this, SPAN_COUNT)
        recyclerView.adapter = adapter

        loadHistory()
    }

    override fun onResume() {
        super.onResume()
        loadHistory()
    }

    private fun loadHistory() {
        Thread {
            val items = try {
                ScreenshotHistoryRepository.list(applicationContext)
            } catch (t: Throwable) {
                null
            }
            Handler(Looper.getMainLooper()).post {
                if (items == null) {
                    Snackbar.make(recyclerView, R.string.history_load_failed, Snackbar.LENGTH_LONG).show()
                } else {
                    adapter.submitList(items)
                    updateEmptyState()
                }
            }
        }.start()
    }

    private fun updateEmptyState() {
        val empty = adapter.isEmpty()
        emptyText.visibility = if (empty) View.VISIBLE else View.GONE
        recyclerView.visibility = if (empty) View.GONE else View.VISIBLE
    }

    private fun openItem(item: HistoryItem) {
        try {
            val viewIntent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(item.uri, item.mimeType)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            startActivity(Intent.createChooser(viewIntent, item.displayName))
        } catch (t: Throwable) {
            Toast.makeText(this, R.string.history_open_failed, Toast.LENGTH_SHORT).show()
        }
    }

    private fun confirmDelete(item: HistoryItem) {
        MaterialAlertDialogBuilder(this)
            .setTitle(R.string.history_delete_dialog_title)
            .setMessage(R.string.history_delete_dialog_message)
            .setNegativeButton(R.string.cancel_action, null)
            .setPositiveButton(R.string.history_delete_action) { _, _ -> deleteItem(item) }
            .show()
    }

    private fun deleteItem(item: HistoryItem) {
        Thread {
            val deleted = ScreenshotHistoryRepository.delete(applicationContext, item.uri)
            Handler(Looper.getMainLooper()).post {
                if (deleted) {
                    adapter.removeItem(item.uri)
                    updateEmptyState()
                    Snackbar.make(recyclerView, R.string.history_deleted, Snackbar.LENGTH_SHORT).show()
                } else {
                    Snackbar.make(recyclerView, R.string.history_delete_failed, Snackbar.LENGTH_SHORT).show()
                }
            }
        }.start()
    }

    companion object {
        private const val SPAN_COUNT = 3
    }
}
