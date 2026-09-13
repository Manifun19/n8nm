# Smart Screenshot (Android)

A standalone Android app implementing the "Smart Screenshot" feature: a
small floating bubble that captures the current screen in one tap, opens a
crop/rotate editor, and lets you save (PNG/JPG) and share the result. No
OCR, no AI, no cloud upload — capture stays local to the device.

This lives at `android/SmartScreenshot/` inside the `n8nm` repository as its
own Gradle project. It is intentionally separate from the rest of the
repo (which is n8n, a web workflow-automation platform) and does not touch
any existing n8n code.

## Project layout

```
android/SmartScreenshot/
  app/src/main/java/com/smartscreenshot/app/
    MainActivity.kt              # enable/disable the bubble, permission prompts
    SmartScreenshotApp.kt        # clears stale temp files on launch
    bubble/FloatingBubbleService.kt      # overlay bubble: drag, tap-to-capture
    capture/
      MediaProjectionPermissionActivity.kt  # hosts the one-time system consent dialog
      CaptureRequestBridge.kt               # passes that result back to the service
      ScreenCaptureManager.kt               # MediaProjection -> single Bitmap frame
    editor/
      CropEditorActivity.kt        # editor screen: toolbar wiring, save/share/discard
      CropOverlayView.kt           # free-form draggable crop rectangle (L-bracket handles, edge ticks)
      EditorState.kt               # undo/redo/rotate/crop/reset bitmap history
      AspectRatioOption.kt         # Free / 1:1 / 4:3 / 16:9 / 9:16 / A4
    storage/
      ScreenshotSaver.kt           # MediaStore (Q+) / legacy file save, PNG or JPG
      ShareHelper.kt                # native Android share sheet
      TempFileManager.kt           # app-cache temp file lifecycle
    history/
      HistoryActivity.kt           # grid of past saves, tap-to-view, long-press-to-delete
      HistoryAdapter.kt            # RecyclerView grid + background thumbnail loading
      ScreenshotHistoryRepository.kt  # reads the "Smart Screenshot" MediaStore album
      HistoryItem.kt                # uri / name / date / mime model
    util/
      BitmapUtils.kt               # rotate/crop/downsample/recycle helpers
      FileNameGenerator.kt         # "Screenshot_YYYYMMDD_HHMMSS"
  app/src/main/res/                # layouts, vector icons, strings (en + hi), theme
  build.gradle.kts, settings.gradle.kts, gradle.properties
```

Every source file is new; nothing outside `android/SmartScreenshot/` was
modified.

## How capture actually works (and why)

Android has no public API to silently screenshot "whatever is currently on
screen" across arbitrary apps. The only non-root, non-bypass way is
`MediaProjection` (the same system used by screen recorders): it requires a
one-time **system** consent dialog ("Start recording or casting?").

Flow:
1. `MainActivity` requests the "Display over other apps" (`SYSTEM_ALERT_WINDOW`)
   permission, then starts `FloatingBubbleService` as a foreground service.
2. On the **first** bubble tap, the service launches a transparent
   `MediaProjectionPermissionActivity` that shows the system consent dialog.
   Once granted, the `MediaProjection` token is kept alive in the service for
   the rest of that session — later taps capture immediately, no
   re-prompting.
3. Each capture hides the bubble view, waits two draw passes (so the hide is
   actually composited), grabs one frame via `ImageReader` +
   `VirtualDisplay` at full device resolution, restores the bubble, and
   opens the crop editor with the captured frame.

This is why the bubble never appears in the screenshot, and why capture is
"one tap" for every shot after the very first.

## Screenshot history

`MainActivity` has a "Screenshot history" button opening `HistoryActivity`:
a grid of every screenshot this app has saved, tap to open it in the
system image viewer, long-press to delete (with confirmation). Deliberately
has **no separate database** — `ScreenshotSaver` already writes every save
into a dedicated "Smart Screenshot" MediaStore album, so
`ScreenshotHistoryRepository` just queries that album. This matches the
original MVP guidance (don't stand up a complex database if the gallery
already holds the data) while staying future-ready: if history ever needs
data MediaStore doesn't hold (tags, notes, folders), only the repository
and `HistoryItem` model would need to grow, not the rest of the app.

Thumbnails load off the main thread (`ContentResolver.loadThumbnail` on
Android 10+, a sampled `BitmapFactory` decode below that) and are matched
back to their `ViewHolder` by URI so fast scrolling never shows a stale
image.

## Files changed

None. This is a new, additive feature in a new directory; no existing file
in the repository was modified.

## Files created

All under `android/SmartScreenshot/` — see the layout above for the full
list (Kotlin sources + resources, plus the Gradle project files:
`settings.gradle.kts`, `build.gradle.kts`, `gradle.properties`,
`app/build.gradle.kts`, `app/proguard-rules.pro`,
`gradle/wrapper/gradle-wrapper.properties`, `.gitignore`).

## Android permissions required

| Permission | Why | Requested |
|---|---|---|
| `SYSTEM_ALERT_WINDOW` | Draw the floating bubble over other apps | Settings screen (`ACTION_MANAGE_OVERLAY_PERMISSION`), from `MainActivity` |
| `FOREGROUND_SERVICE` / `FOREGROUND_SERVICE_MEDIA_PROJECTION` | Keep the bubble/capture session alive | Declared only; no runtime prompt |
| `POST_NOTIFICATIONS` (Android 13+) | Required to show the foreground-service notification | Runtime prompt from `MainActivity` |
| Screen capture consent (`MediaProjection`) | Required by Android for any screen-capture API | System dialog, once per bubble session, on first tap |
| `WRITE_EXTERNAL_STORAGE` (Android 9 and below only, `maxSdkVersion=28`) | Legacy public-storage write; not needed on Android 10+ (MediaStore/scoped storage) | Runtime prompt from `CropEditorActivity`, only triggered on API ≤ 28 |

No `INTERNET` permission — the feature has no network code path at all.

## Dependencies added

Only standard AndroidX/Material libraries — nothing cropping-, OCR-, or
AI-related:
`androidx.core:core-ktx`, `androidx.appcompat:appcompat`,
`com.google.android.material:material`,
`androidx.constraintlayout:constraintlayout`,
`androidx.activity:activity-ktx`,
`androidx.recyclerview:recyclerview` (for the history grid).
The crop UI, undo/redo history, MediaProjection capture, and screenshot
history are all hand-written in this project — no third-party
image-cropping or image-loading (Glide/Coil) library.

## How to build/run

Requires Android Studio (or the Android SDK + `sdkmanager`) since this
sandbox has no Android SDK installed, only a bare JDK/Gradle — a full
`gradle assembleDebug` could not be executed here. What *was* verified in
this environment:
- `gradle help` against the project confirms `settings.gradle.kts` /
  `build.gradle.kts` / `app/build.gradle.kts` parse correctly (it got as
  far as resolving the AGP plugin from Google's Maven repo before this
  sandbox's network policy blocked that download — an environment
  limitation, not a project issue).
- Every `R.id` / `R.string` / `R.drawable` / `R.dimen` / `R.layout`
  reference in the Kotlin sources was cross-checked against the actual XML
  resources; every custom-view fully-qualified class name in layouts
  matches the Kotlin package/class it points to.

To actually build:
1. Open `android/SmartScreenshot/` in Android Studio (Hedgehog+ recommended).
   It will generate the Gradle wrapper jar automatically on first sync.
2. Let it sync (downloads AGP 8.5.2, Kotlin 1.9.24, compileSdk 34).
3. Run on a device/emulator running Android 7.0 (API 24) or newer.

## Testing steps

1. **Launch** the app → tap "Enable floating bubble".
2. Grant **"Display over other apps"** when prompted (opens system Settings;
   toggle it on and go back).
3. Grant the **notification** permission if prompted (Android 13+).
4. The bubble appears near the right edge of the screen. **Drag** it — it
   should snap to the nearest edge on release.
5. Open any other app/screen (home screen, browser, a form, a PDF).
6. **Single-tap** the bubble.
   - First time only: a system dialog ("Start recording or casting?")
     appears — tap **Start**.
   - The bubble should momentarily disappear, then the crop editor should
     open with a full-resolution screenshot of whatever was behind the
     bubble. The bubble itself should not be visible in the captured image.
7. In the editor:
   - Drag a corner (L-bracket handle) — the crop box should resize smoothly,
     and that bracket should highlight (accent color, slightly larger)
     while held. A rule-of-thirds grid should appear only while dragging,
     and disappear once you release.
   - Drag an edge tick (the short bar at the middle of each side) — that
     side alone should move.
   - Drag inside the crop box — it should move as a whole.
   - Try an aspect-ratio chip (e.g. 1:1) — the box should snap to that
     ratio, the edge ticks should disappear (locked ratio only resizes from
     corners), and it should only corner-resize from then on.
   - Tap **Rotate left/right** — image rotates 90°.
   - Tap **Crop** — image is cropped to the selected box.
   - Tap **Undo** — reverts the last crop/rotate. **Redo** re-applies it.
   - Tap **Reset** — reverts everything back to the original capture.
8. Tap **Save** → confirm/edit the filename → pick PNG or JPG → **Save**.
   - A "Screenshot saved successfully" Snackbar should appear.
   - Open the device Gallery/Photos app → a "Smart Screenshot" album should
     contain the saved image.
9. Tap **Share** → the native Android share sheet should open with the
   saved image (test with WhatsApp/Telegram/Email/etc., whichever is
   installed).
10. Start a new capture, make an edit, then press system **Back** before
    saving → a "Discard screenshot?" dialog should appear (Cancel / Discard).
    Discard should delete the temp file and return to the previous screen.
11. Tap "Disable floating bubble" in the app → the bubble and its
    notification should disappear.
12. Tap **"Screenshot history"** on the main screen.
    - Every screenshot saved so far should appear as a thumbnail grid,
      newest first.
    - Tap a thumbnail → it should open in the system image viewer.
    - Long-press a thumbnail → "Delete screenshot?" dialog → confirm →
      the item should disappear from both the grid and the device Gallery.
    - Delete every screenshot → an empty-state message should replace the
      grid.

Also worth checking: capturing a screen with a lot of content (e.g. a long
form or a PDF viewer) to confirm no visible lag/freeze, and taking several
screenshots back-to-back to confirm memory stays stable (no OOM after
repeated crop/rotate/undo cycles, thanks to the capped 12-step undo history
in `EditorState`).

## Known Android limitations

- **First-capture consent dialog is unavoidable.** Android requires the
  system "Start recording or casting?" prompt before any app can use
  `MediaProjection` — there is no way to skip or pre-approve it without
  root, and doing so would violate the "don't bypass Android security" rule
  in the spec. It's a one-time-per-session cost; every capture after it is
  truly one-tap.
- **The consent can be revoked mid-session** by the user via the system's
  "Stop casting" control in the status bar. The app detects this
  (`MediaProjection.Callback.onStop`) and will simply re-prompt on the next
  bubble tap rather than crash.
- **Content that opts out of screenshots** (apps/screens using
  `FLAG_SECURE`, e.g. banking apps, DRM video) will appear black in the
  capture — this is enforced by Android at the OS level and cannot be
  worked around, nor should it be.
- **`WindowManager.getDefaultDisplay()` is deprecated** (used to size the
  capture to the real display in `ScreenCaptureManager`). It still works
  correctly through the current Android versions; a future update could
  migrate to `WindowMetrics`/`getCurrentWindowMetrics` for the same result
  without the deprecation warning.
- **Foreground-service background-start rules** (Android 14/API 34): the
  `mediaProjection`-typed foreground service must be started from a
  user-initiated event, which it is here (the "Enable floating bubble"
  button tap) — but on some OEM skins with aggressive battery/background
  restrictions, the bubble service may still be killed by the system if the
  app is swiped away from Recents; the user would need to re-enable it from
  the app.
- **Legacy storage path (Android 9 and below)**: saved screenshots go into
  a public `Pictures/Smart Screenshot` folder and are indexed into
  MediaStore afterward; on Android 10+ they're written directly via
  MediaStore/scoped storage, which is the modern, permission-light path.
