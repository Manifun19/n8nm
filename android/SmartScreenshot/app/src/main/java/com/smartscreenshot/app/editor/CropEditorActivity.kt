package com.smartscreenshot.app.editor

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Matrix
import android.graphics.RectF
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.RadioGroup
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.button.MaterialButton
import com.google.android.material.chip.Chip
import com.google.android.material.chip.ChipGroup
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.snackbar.Snackbar
import com.google.android.material.textfield.TextInputEditText
import com.smartscreenshot.app.R
import com.smartscreenshot.app.storage.ImageFormat
import com.smartscreenshot.app.storage.ScreenshotSaver
import com.smartscreenshot.app.storage.ShareHelper
import com.smartscreenshot.app.storage.TempFileManager
import com.smartscreenshot.app.util.FileNameGenerator
import java.io.File

class CropEditorActivity : AppCompatActivity() {

    private lateinit var previewImage: ImageView
    private lateinit var cropOverlay: CropOverlayView
    private lateinit var ratioChipGroup: ChipGroup
    private lateinit var undoButton: ImageButton
    private lateinit var redoButton: ImageButton

    private var tempFile: File? = null
    private var state: EditorState? = null
    private var currentMatrix: Matrix = Matrix()

    private var lastSavedUri: Uri? = null
    private var lastSavedMimeType: String? = null
    private var stateFinalized = false
    private var isSaving = false

    private val storagePermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
            if (granted) {
                showSaveDialog()
            } else {
                Snackbar.make(previewImage, R.string.save_failed, Snackbar.LENGTH_LONG).show()
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_crop_editor)

        val path = intent.getStringExtra(EXTRA_TEMP_PATH)
        val file = path?.let { File(it) }
        val original = file?.let { TempFileManager.readBitmap(it) }

        if (file == null || original == null) {
            Toast.makeText(this, R.string.capture_failed, Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        tempFile = file
        state = EditorState(original)

        bindViews()
        setupRatioChips()
        setupBackHandling()
        renderCurrent()
    }

    private fun bindViews() {
        previewImage = findViewById(R.id.previewImage)
        cropOverlay = findViewById(R.id.cropOverlay)
        ratioChipGroup = findViewById(R.id.ratioChipGroup)
        undoButton = findViewById(R.id.undoButton)
        redoButton = findViewById(R.id.redoButton)

        findViewById<ImageButton>(R.id.backButton).setOnClickListener { onBackPressedDispatcher.onBackPressed() }
        findViewById<ImageButton>(R.id.rotateLeftButton).setOnClickListener { rotate(-90f) }
        findViewById<ImageButton>(R.id.rotateRightButton).setOnClickListener { rotate(90f) }
        findViewById<ImageButton>(R.id.resetButton).setOnClickListener { resetEdits() }
        undoButton.setOnClickListener { undo() }
        redoButton.setOnClickListener { redo() }
        findViewById<MaterialButton>(R.id.cropButton).setOnClickListener { applyCrop() }
        findViewById<MaterialButton>(R.id.saveButton).setOnClickListener { onSaveClicked() }
        findViewById<MaterialButton>(R.id.shareButton).setOnClickListener { shareSaved() }
    }

    private fun setupRatioChips() {
        AspectRatioOption.values().forEach { option ->
            val chip = Chip(this).apply {
                setText(option.labelRes)
                isCheckable = true
                isChecked = option == AspectRatioOption.FREE
                tag = option
            }
            ratioChipGroup.addView(chip)
        }
        ratioChipGroup.setOnCheckedStateChangeListener { group, checkedIds ->
            val id = checkedIds.firstOrNull() ?: return@setOnCheckedStateChangeListener
            val option = (group.findViewById<Chip>(id)?.tag as? AspectRatioOption) ?: AspectRatioOption.FREE
            cropOverlay.aspectRatio = option.ratio
        }
    }

    private fun setupBackHandling() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (isSaving) return
                if (lastSavedUri != null) {
                    // Already saved to the gallery; nothing left to lose.
                    discardAndFinish()
                    return
                }
                MaterialAlertDialogBuilder(this@CropEditorActivity)
                    .setTitle(R.string.discard_dialog_title)
                    .setMessage(R.string.discard_dialog_message)
                    .setNegativeButton(R.string.cancel_action, null)
                    .setPositiveButton(R.string.discard_action) { _, _ -> discardAndFinish() }
                    .show()
            }
        })
    }

    private fun discardAndFinish() {
        finalizeState()
        TempFileManager.delete(tempFile)
        finish()
    }

    // ---- Editing actions --------------------------------------------------

    private fun rotate(degrees: Float) {
        state?.applyRotate(degrees)
        renderCurrent()
    }

    private fun undo() {
        if (state?.undo() == true) renderCurrent()
    }

    private fun redo() {
        if (state?.redo() == true) renderCurrent()
    }

    private fun resetEdits() {
        state?.reset()
        (ratioChipGroup.getChildAt(0) as? Chip)?.isChecked = true
        renderCurrent()
    }

    private fun applyCrop() {
        val editorState = state ?: return
        try {
            val inverse = Matrix()
            if (!currentMatrix.invert(inverse)) return
            val bitmapRect = cropOverlay.getCropRect()
            inverse.mapRect(bitmapRect)
            if (bitmapRect.width() < 1f || bitmapRect.height() < 1f) return
            editorState.applyCrop(bitmapRect)
            renderCurrent()
        } catch (t: Throwable) {
            Toast.makeText(this, R.string.crop_failed, Toast.LENGTH_SHORT).show()
        }
    }

    private fun renderCurrent() {
        val bitmap = state?.current ?: return
        previewImage.post {
            val viewWidth = previewImage.width.toFloat()
            val viewHeight = previewImage.height.toFloat()
            if (viewWidth <= 0f || viewHeight <= 0f || bitmap.width <= 0 || bitmap.height <= 0) return@post

            val scale = minOf(viewWidth / bitmap.width, viewHeight / bitmap.height)
            val dx = (viewWidth - bitmap.width * scale) / 2f
            val dy = (viewHeight - bitmap.height * scale) / 2f
            val matrix = Matrix().apply {
                setScale(scale, scale)
                postTranslate(dx, dy)
            }
            currentMatrix = matrix

            previewImage.imageMatrix = matrix
            previewImage.setImageBitmap(bitmap)

            val imageRectInView = RectF(0f, 0f, bitmap.width.toFloat(), bitmap.height.toFloat())
            matrix.mapRect(imageRectInView)
            cropOverlay.imageRect = imageRectInView

            undoButton.isEnabled = state?.canUndo == true
            redoButton.isEnabled = state?.canRedo == true
            undoButton.alpha = if (undoButton.isEnabled) 1f else 0.4f
            redoButton.alpha = if (redoButton.isEnabled) 1f else 0.4f
        }
    }

    // ---- Save / Share -------------------------------------------------------

    private fun onSaveClicked() {
        val needsLegacyPermission = Build.VERSION.SDK_INT < Build.VERSION_CODES.Q &&
            checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED
        if (needsLegacyPermission) {
            storagePermissionLauncher.launch(Manifest.permission.WRITE_EXTERNAL_STORAGE)
        } else {
            showSaveDialog()
        }
    }

    private fun showSaveDialog() {
        val editorState = state ?: return
        val dialogView = layoutInflater.inflate(R.layout.dialog_save, null)
        val filenameInput = dialogView.findViewById<TextInputEditText>(R.id.filenameInput)
        val formatGroup = dialogView.findViewById<RadioGroup>(R.id.formatRadioGroup)
        filenameInput.setText(FileNameGenerator.defaultName())

        MaterialAlertDialogBuilder(this)
            .setTitle(R.string.save_dialog_title)
            .setView(dialogView)
            .setNegativeButton(R.string.cancel_action, null)
            .setPositiveButton(R.string.save_action) { _, _ ->
                val format = if (formatGroup.checkedRadioButtonId == R.id.formatJpg) ImageFormat.JPG else ImageFormat.PNG
                val name = FileNameGenerator.sanitize(filenameInput.text?.toString().orEmpty())
                performSave(editorState.current, name, format)
            }
            .show()
    }

    private fun performSave(bitmap: Bitmap, name: String, format: ImageFormat) {
        isSaving = true
        findViewById<MaterialButton>(R.id.saveButton).isEnabled = false
        Thread {
            val result = ScreenshotSaver.save(applicationContext, bitmap, name, format)
            Handler(Looper.getMainLooper()).post {
                isSaving = false
                findViewById<MaterialButton>(R.id.saveButton).isEnabled = true
                when (result) {
                    is ScreenshotSaver.Result.Success -> {
                        lastSavedUri = result.uri
                        lastSavedMimeType = format.mimeType
                        TempFileManager.delete(tempFile)
                        Snackbar.make(previewImage, R.string.save_success, Snackbar.LENGTH_SHORT).show()
                    }
                    is ScreenshotSaver.Result.Failure -> {
                        Snackbar.make(previewImage, R.string.save_failed, Snackbar.LENGTH_LONG).show()
                    }
                }
            }
        }.start()
    }

    private fun shareSaved() {
        val uri = lastSavedUri
        val mime = lastSavedMimeType
        if (uri == null || mime == null) {
            Snackbar.make(previewImage, R.string.share_needs_save_first, Snackbar.LENGTH_SHORT).show()
            return
        }
        try {
            ShareHelper.share(this, uri, mime)
        } catch (t: Throwable) {
            Snackbar.make(previewImage, R.string.share_failed, Snackbar.LENGTH_SHORT).show()
        }
    }

    private fun finalizeState() {
        // Skip while a save is writing this bitmap off the main thread —
        // recycling it here would race the background compress() call.
        if (!stateFinalized && !isSaving) {
            stateFinalized = true
            state?.recycleAll()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        finalizeState()
    }

    companion object {
        private const val EXTRA_TEMP_PATH = "extra_temp_path"

        fun start(context: Context, tempFilePath: String) {
            val intent = Intent(context, CropEditorActivity::class.java).apply {
                putExtra(EXTRA_TEMP_PATH, tempFilePath)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        }
    }
}
