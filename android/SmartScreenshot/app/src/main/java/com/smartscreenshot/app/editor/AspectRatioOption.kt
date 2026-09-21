package com.smartscreenshot.app.editor

import androidx.annotation.StringRes
import com.smartscreenshot.app.R

enum class AspectRatioOption(@StringRes val labelRes: Int, val ratio: Float?) {
    FREE(R.string.ratio_free, null),
    ONE_TO_ONE(R.string.ratio_1_1, 1f),
    FOUR_TO_THREE(R.string.ratio_4_3, 4f / 3f),
    SIXTEEN_TO_NINE(R.string.ratio_16_9, 16f / 9f),
    NINE_TO_SIXTEEN(R.string.ratio_9_16, 9f / 16f),
    A4(R.string.ratio_a4, 210f / 297f)
}
