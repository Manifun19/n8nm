package com.smartscreenshot.app.history

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Size
import android.view.LayoutInflater
import android.view.ViewGroup
import android.widget.ImageView
import androidx.recyclerview.widget.RecyclerView
import com.smartscreenshot.app.R

class HistoryAdapter(
    private val context: Context,
    private val onClick: (HistoryItem) -> Unit,
    private val onLongClick: (HistoryItem) -> Boolean
) : RecyclerView.Adapter<HistoryAdapter.ViewHolder>() {

    private val items = mutableListOf<HistoryItem>()

    fun submitList(newItems: List<HistoryItem>) {
        items.clear()
        items.addAll(newItems)
        notifyDataSetChanged()
    }

    fun removeItem(uri: Uri) {
        val index = items.indexOfFirst { it.uri == uri }
        if (index != -1) {
            items.removeAt(index)
            notifyItemRemoved(index)
        }
    }

    fun isEmpty(): Boolean = items.isEmpty()

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_history, parent, false)
        return ViewHolder(view as ImageView)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val item = items[position]
        holder.bind(item, context, onClick, onLongClick)
    }

    override fun getItemCount(): Int = items.size

    class ViewHolder(private val imageView: ImageView) : RecyclerView.ViewHolder(imageView) {
        private var boundUri: Uri? = null

        fun bind(item: HistoryItem, context: Context, onClick: (HistoryItem) -> Unit, onLongClick: (HistoryItem) -> Boolean) {
            boundUri = item.uri
            imageView.setImageDrawable(null)
            imageView.setOnClickListener { onClick(item) }
            imageView.setOnLongClickListener { onLongClick(item) }
            loadThumbnail(context, item.uri) { bitmap ->
                if (boundUri == item.uri && bitmap != null) {
                    imageView.setImageBitmap(bitmap)
                }
            }
        }

        private fun loadThumbnail(context: Context, uri: Uri, onLoaded: (Bitmap?) -> Unit) {
            Thread {
                val bitmap = try {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        context.contentResolver.loadThumbnail(uri, Size(300, 300), null)
                    } else {
                        decodeSampledThumbnail(context, uri, 300, 300)
                    }
                } catch (t: Throwable) {
                    null
                }
                Handler(Looper.getMainLooper()).post { onLoaded(bitmap) }
            }.start()
        }

        private fun decodeSampledThumbnail(context: Context, uri: Uri, reqWidth: Int, reqHeight: Int): Bitmap? {
            val resolver = context.contentResolver
            val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
            resolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, bounds) }

            var sampleSize = 1
            val halfWidth = bounds.outWidth / 2
            val halfHeight = bounds.outHeight / 2
            while (halfWidth / sampleSize >= reqWidth && halfHeight / sampleSize >= reqHeight) {
                sampleSize *= 2
            }

            val options = BitmapFactory.Options().apply { inSampleSize = sampleSize }
            return resolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, options) }
        }
    }
}
