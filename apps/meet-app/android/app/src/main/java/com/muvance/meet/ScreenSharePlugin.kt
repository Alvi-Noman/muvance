package com.muvance.meet

import android.Manifest
import android.app.Activity
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.media.projection.MediaProjectionManager
import android.os.Build
import androidx.activity.result.ActivityResult
import androidx.core.app.NotificationCompat
import com.getcapacitor.JSObject
import com.getcapacitor.PermissionState
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.ActivityCallback
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission
import com.getcapacitor.annotation.PermissionCallback
import io.livekit.android.LiveKit
import io.livekit.android.events.RoomEvent
import io.livekit.android.events.collect
import io.livekit.android.room.Room
import io.livekit.android.room.track.screencapture.ScreenCaptureParams
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch

/**
 * Presents the phone's screen in a call. The call itself runs in the web page, which can't capture
 * the screen on Android, so the screen joins the call separately with its own token from the API.
 */
@CapacitorPlugin(
    name = "ScreenShare",
    permissions = [Permission(alias = "microphone", strings = [Manifest.permission.RECORD_AUDIO])],
)
class ScreenSharePlugin : Plugin() {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private var room: Room? = null
    private var watcher: Job? = null

    @PluginMethod
    fun start(call: PluginCall) {
        if (call.getString("url") == null || call.getString("token") == null) {
            call.reject("Missing url or token")
            return
        }
        if (room != null) {
            call.resolve()
            return
        }
        // While you present, the call is in the background. Android only keeps a background call's
        // microphone on when the app is allowed to use it, so others can still hear you.
        if (getPermissionState(MICROPHONE) != PermissionState.GRANTED) {
            requestPermissionForAlias(MICROPHONE, call, "afterMicrophone")
            return
        }
        askToCapture(call)
    }

    @PermissionCallback
    private fun afterMicrophone(call: PluginCall) {
        if (getPermissionState(MICROPHONE) == PermissionState.GRANTED) askToCapture(call)
        else call.reject("Allow the microphone to present your screen", "MICROPHONE_DENIED")
    }

    private fun askToCapture(call: PluginCall) {
        val manager = context.getSystemService(MediaProjectionManager::class.java)
        startActivityForResult(call, manager.createScreenCaptureIntent(), "afterCaptureChoice")
    }

    @ActivityCallback
    private fun afterCaptureChoice(call: PluginCall?, result: ActivityResult) {
        if (call == null) return
        val data = result.data
        if (result.resultCode != Activity.RESULT_OK || data == null) {
            call.reject("Cancelled", "CANCELLED")
            return
        }
        val url = call.getString("url")!!
        val token = call.getString("token")!!
        val next = LiveKit.create(context.applicationContext)
        room = next
        scope.launch {
            try {
                next.connect(url, token)
                watcher = scope.launch {
                    next.events.collect { event ->
                        if (event is RoomEvent.Disconnected) finish(next, notify = true)
                    }
                }
                val params = ScreenCaptureParams(
                    mediaProjectionPermissionResultData = data,
                    notificationId = NOTIFICATION_ID,
                    notification = notification(),
                    // The system's own "Stop sharing" ends it too.
                    onStop = { scope.launch { finish(next, notify = true) } },
                )
                if (!next.localParticipant.setScreenShareEnabled(true, params)) {
                    error("Couldn't start sharing")
                }
                call.resolve()
            } catch (e: Throwable) {
                finish(next, notify = false)
                call.reject(e.message ?: "Couldn't present your screen")
            }
        }
    }

    @PluginMethod
    fun stop(call: PluginCall) {
        room?.let { finish(it, notify = false) }
        call.resolve()
    }

    /** The notification's "Stop presenting" button opens the app with this extra. */
    override fun handleOnNewIntent(intent: Intent) {
        super.handleOnNewIntent(intent)
        if (intent.getBooleanExtra(EXTRA_STOP, false)) room?.let { finish(it, notify = true) }
    }

    override fun handleOnDestroy() {
        room?.let { finish(it, notify = false) }
        scope.cancel()
        super.handleOnDestroy()
    }

    private fun finish(which: Room, notify: Boolean) {
        if (room !== which) return
        room = null
        watcher?.cancel()
        watcher = null
        which.disconnect()
        which.release()
        if (notify) notifyListeners("stopped", JSObject())
    }

    private fun notification(): Notification {
        val manager = context.getSystemService(NotificationManager::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            manager.createNotificationChannel(
                NotificationChannel(CHANNEL_ID, "Presenting", NotificationManager.IMPORTANCE_LOW),
            )
        }
        val open = Intent(context, MainActivity::class.java)
            .setFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
        val flags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        return NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_stat_present)
            .setContentTitle("You're presenting your screen")
            .setContentText("Everyone in the call can see it. Tap to go back to the call.")
            .setOngoing(true)
            .setContentIntent(PendingIntent.getActivity(context, 0, open, flags))
            .addAction(
                0,
                "Stop presenting",
                PendingIntent.getActivity(context, 1, Intent(open).putExtra(EXTRA_STOP, true), flags),
            )
            .build()
    }

    companion object {
        private const val MICROPHONE = "microphone"
        private const val CHANNEL_ID = "presenting"
        private const val NOTIFICATION_ID = 7001
        private const val EXTRA_STOP = "stopPresenting"
    }
}
