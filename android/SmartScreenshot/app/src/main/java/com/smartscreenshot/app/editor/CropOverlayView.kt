package com.smartscreenshot.app.editor

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF
import android.util.AttributeSet
import android.view.MotionEvent
import android.view.View
import com.smartscreenshot.app.R

/**
 * Draws a free-form, draggable crop rectangle over the currently displayed
 * image and lets the user move it, resize it from any corner/edge, or (when
 * [aspectRatio] is set) resize it locked to a fixed ratio.
 */
class CropOverlayView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : View(context, attrs) {

    /** Bounds (in this view's coordinate space) of the currently displayed image. */
    var imageRect: RectF = RectF()
        set(value) {
            field = value
            resetCropToImage()
        }

    /** Null = free-form. Otherwise width/height is kept locked to this ratio. */
    var aspectRatio: Float? = null
        set(value) {
            field = value
            value?.let { applyRatioAnchoredAtCenter(it) }
            invalidate()
        }

    private val cropRect = RectF()

    private val touchRadiusPx = resources.getDimension(R.dimen.crop_handle_touch_radius)
    private val handleDrawRadiusPx = resources.getDimension(R.dimen.crop_handle_draw_radius)
    private val minSizePx = resources.getDimension(R.dimen.crop_min_size)

    private val scrimPaint = Paint().apply { color = Color.parseColor("#B3000000") }
    private val borderPaint = Paint().apply {
        color = Color.WHITE
        style = Paint.Style.STROKE
        strokeWidth = 3f
        isAntiAlias = true
    }
    private val gridPaint = Paint().apply {
        color = Color.argb(90, 255, 255, 255)
        style = Paint.Style.STROKE
        strokeWidth = 1.5f
        isAntiAlias = true
    }
    private val handlePaint = Paint().apply {
        color = Color.WHITE
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    private enum class DragMode { NONE, MOVE, TL, TR, BL, BR, LEFT, TOP, RIGHT, BOTTOM }

    private var dragMode = DragMode.NONE
    private var lastTouchX = 0f
    private var lastTouchY = 0f

    fun resetCropToImage() {
        cropRect.set(imageRect)
        invalidate()
    }

    /** Returns a copy of the current crop rectangle, in this view's coordinates. */
    fun getCropRect(): RectF = RectF(cropRect)

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        if (cropRect.isEmpty) return

        // Scrim over everything except the crop window.
        canvas.drawRect(0f, 0f, width.toFloat(), cropRect.top, scrimPaint)
        canvas.drawRect(0f, cropRect.bottom, width.toFloat(), height.toFloat(), scrimPaint)
        canvas.drawRect(0f, cropRect.top, cropRect.left, cropRect.bottom, scrimPaint)
        canvas.drawRect(cropRect.right, cropRect.top, width.toFloat(), cropRect.bottom, scrimPaint)

        // Rule-of-thirds grid.
        val w = cropRect.width()
        val h = cropRect.height()
        for (i in 1..2) {
            val x = cropRect.left + w * i / 3f
            canvas.drawLine(x, cropRect.top, x, cropRect.bottom, gridPaint)
            val y = cropRect.top + h * i / 3f
            canvas.drawLine(cropRect.left, y, cropRect.right, y, gridPaint)
        }

        canvas.drawRect(cropRect, borderPaint)

        // Corner handles.
        for ((cx, cy) in listOf(
            cropRect.left to cropRect.top,
            cropRect.right to cropRect.top,
            cropRect.left to cropRect.bottom,
            cropRect.right to cropRect.bottom
        )) {
            canvas.drawCircle(cx, cy, handleDrawRadiusPx, handlePaint)
        }
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event.action) {
            MotionEvent.ACTION_DOWN -> {
                dragMode = detectDragMode(event.x, event.y)
                lastTouchX = event.x
                lastTouchY = event.y
                return dragMode != DragMode.NONE
            }
            MotionEvent.ACTION_MOVE -> {
                if (dragMode == DragMode.NONE) return false
                val dx = event.x - lastTouchX
                val dy = event.y - lastTouchY
                lastTouchX = event.x
                lastTouchY = event.y
                applyDrag(dx, dy)
                invalidate()
                return true
            }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                dragMode = DragMode.NONE
                return true
            }
        }
        return false
    }

    private fun detectDragMode(x: Float, y: Float): DragMode {
        val nearLeft = kotlin.math.abs(x - cropRect.left) < touchRadiusPx
        val nearRight = kotlin.math.abs(x - cropRect.right) < touchRadiusPx
        val nearTop = kotlin.math.abs(y - cropRect.top) < touchRadiusPx
        val nearBottom = kotlin.math.abs(y - cropRect.bottom) < touchRadiusPx
        val withinVertical = y > cropRect.top - touchRadiusPx && y < cropRect.bottom + touchRadiusPx
        val withinHorizontal = x > cropRect.left - touchRadiusPx && x < cropRect.right + touchRadiusPx

        return when {
            nearLeft && nearTop -> DragMode.TL
            nearRight && nearTop -> DragMode.TR
            nearLeft && nearBottom -> DragMode.BL
            nearRight && nearBottom -> DragMode.BR
            aspectRatio == null && nearLeft && withinVertical -> DragMode.LEFT
            aspectRatio == null && nearRight && withinVertical -> DragMode.RIGHT
            aspectRatio == null && nearTop && withinHorizontal -> DragMode.TOP
            aspectRatio == null && nearBottom && withinHorizontal -> DragMode.BOTTOM
            cropRect.contains(x, y) -> DragMode.MOVE
            else -> DragMode.NONE
        }
    }

    private fun applyDrag(dx: Float, dy: Float) {
        when (dragMode) {
            DragMode.MOVE -> {
                var newLeft = cropRect.left + dx
                var newTop = cropRect.top + dy
                newLeft = newLeft.coerceIn(imageRect.left, imageRect.right - cropRect.width())
                newTop = newTop.coerceIn(imageRect.top, imageRect.bottom - cropRect.height())
                cropRect.offsetTo(newLeft, newTop)
            }
            DragMode.LEFT -> cropRect.left = clampLeft(cropRect.left + dx)
            DragMode.RIGHT -> cropRect.right = clampRight(cropRect.right + dx)
            DragMode.TOP -> cropRect.top = clampTop(cropRect.top + dy)
            DragMode.BOTTOM -> cropRect.bottom = clampBottom(cropRect.bottom + dy)
            DragMode.TL -> dragCorner(dx, dy, fixedRight = true, fixedBottom = true)
            DragMode.TR -> dragCorner(dx, dy, fixedRight = false, fixedBottom = true)
            DragMode.BL -> dragCorner(dx, dy, fixedRight = true, fixedBottom = false)
            DragMode.BR -> dragCorner(dx, dy, fixedRight = false, fixedBottom = false)
            else -> Unit
        }
    }

    private fun dragCorner(dx: Float, dy: Float, fixedRight: Boolean, fixedBottom: Boolean) {
        val ratio = aspectRatio
        if (ratio == null) {
            if (fixedRight) cropRect.left = clampLeft(cropRect.left + dx) else cropRect.right = clampRight(cropRect.right + dx)
            if (fixedBottom) cropRect.top = clampTop(cropRect.top + dy) else cropRect.bottom = clampBottom(cropRect.bottom + dy)
            return
        }

        // Anchor is the opposite corner; drive size from the touch delta and
        // re-derive the locked dimension from the ratio.
        val anchorX = if (fixedRight) cropRect.right else cropRect.left
        val anchorY = if (fixedBottom) cropRect.bottom else cropRect.top
        val movingX = (if (fixedRight) cropRect.left else cropRect.right) + dx
        var newWidth = kotlin.math.abs(movingX - anchorX)
        newWidth = newWidth.coerceIn(minSizePx, imageRect.width())
        var newHeight = newWidth / ratio
        if (newHeight > imageRect.height()) {
            newHeight = imageRect.height()
            newWidth = newHeight * ratio
        }

        val left: Float
        val right: Float
        if (fixedRight) {
            right = anchorX
            left = (right - newWidth).coerceAtLeast(imageRect.left)
        } else {
            left = anchorX
            right = (left + newWidth).coerceAtMost(imageRect.right)
        }
        val top: Float
        val bottom: Float
        if (fixedBottom) {
            bottom = anchorY
            top = (bottom - newHeight).coerceAtLeast(imageRect.top)
        } else {
            top = anchorY
            bottom = (top + newHeight).coerceAtMost(imageRect.bottom)
        }
        cropRect.set(left, top, right, bottom)
    }

    private fun applyRatioAnchoredAtCenter(ratio: Float) {
        if (imageRect.isEmpty) return
        val centerX = cropRect.centerX()
        val centerY = cropRect.centerY()
        var w = cropRect.width()
        var h = w / ratio
        if (h > imageRect.height()) {
            h = imageRect.height()
            w = h * ratio
        }
        if (w > imageRect.width()) {
            w = imageRect.width()
            h = w / ratio
        }
        var left = centerX - w / 2
        var top = centerY - h / 2
        left = left.coerceIn(imageRect.left, imageRect.right - w)
        top = top.coerceIn(imageRect.top, imageRect.bottom - h)
        cropRect.set(left, top, left + w, top + h)
    }

    private fun clampLeft(value: Float) = value.coerceIn(imageRect.left, cropRect.right - minSizePx)
    private fun clampRight(value: Float) = value.coerceIn(cropRect.left + minSizePx, imageRect.right)
    private fun clampTop(value: Float) = value.coerceIn(imageRect.top, cropRect.bottom - minSizePx)
    private fun clampBottom(value: Float) = value.coerceIn(cropRect.top + minSizePx, imageRect.bottom)
}
