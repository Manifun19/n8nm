package com.smartscreenshot.app.editor

import android.graphics.Bitmap
import android.graphics.RectF
import com.smartscreenshot.app.util.BitmapUtils

/**
 * Owns the bitmap history for one editing session (crop/rotate/undo/redo/reset).
 * [original] is never mutated or recycled here; every operation transforms
 * [current] and pushes the previous bitmap onto a capped undo stack so large
 * screenshots don't accumulate unbounded memory.
 */
class EditorState(val original: Bitmap) {

    var current: Bitmap = original
        private set

    private val undoStack = ArrayDeque<Bitmap>()
    private val redoStack = ArrayDeque<Bitmap>()
    private val maxHistory = 12

    val canUndo: Boolean get() = undoStack.isNotEmpty()
    val canRedo: Boolean get() = redoStack.isNotEmpty()

    fun applyRotate(degrees: Float) {
        replaceCurrent(BitmapUtils.rotate(current, degrees))
    }

    fun applyCrop(rectInBitmapCoords: RectF) {
        replaceCurrent(BitmapUtils.crop(current, rectInBitmapCoords))
    }

    private fun replaceCurrent(next: Bitmap) {
        val previous = current
        undoStack.addLast(previous)
        if (undoStack.size > maxHistory) {
            val evicted = undoStack.removeFirst()
            if (evicted !== original) BitmapUtils.safeRecycle(evicted)
        }
        clearRedo()
        current = next
    }

    fun undo(): Boolean {
        if (undoStack.isEmpty()) return false
        redoStack.addLast(current)
        current = undoStack.removeLast()
        return true
    }

    fun redo(): Boolean {
        if (redoStack.isEmpty()) return false
        undoStack.addLast(current)
        current = redoStack.removeLast()
        return true
    }

    fun reset() {
        recycleStack(undoStack)
        clearRedo()
        if (current !== original) BitmapUtils.safeRecycle(current)
        current = original
    }

    fun recycleAll() {
        recycleStack(undoStack)
        clearRedo()
        if (current !== original) BitmapUtils.safeRecycle(current)
        BitmapUtils.safeRecycle(original)
    }

    private fun clearRedo() {
        recycleStack(redoStack)
    }

    private fun recycleStack(stack: ArrayDeque<Bitmap>) {
        stack.forEach { if (it !== original) BitmapUtils.safeRecycle(it) }
        stack.clear()
    }
}
