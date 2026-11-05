package com.muvance.admin;

import android.app.ActivityManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.ContentResolver;
import android.content.Intent;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import com.capacitorjs.plugins.pushnotifications.MessagingService;
import com.google.firebase.messaging.RemoteMessage;
import java.util.Map;

/**
 * Builds the new lead notification here, because a notification sent by Firebase can't have buttons.
 * While the app is open, the admin handles the alert itself instead (see notifications/push.ts).
 */
public class LeadMessagingService extends MessagingService {

    private static final String CHANNEL_ID = "new-leads";

    @Override
    public void onMessageReceived(@NonNull RemoteMessage message) {
        Map<String, String> data = message.getData();
        String leadId = data.get("leadId");
        if (leadId == null || isInForeground()) {
            super.onMessageReceived(message);
            return;
        }

        createChannel();
        int id = leadId.hashCode();
        String messageId = message.getMessageId() == null ? leadId : message.getMessageId();

        NotificationCompat.Builder notification = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_stat_new_lead)
            .setContentTitle(data.get("title"))
            .setContentText(data.get("body"))
            .setStyle(new NotificationCompat.BigTextStyle().bigText(data.get("body")))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_MESSAGE)
            .setSound(soundUri())
            .setAutoCancel(true)
            .setContentIntent(openApp(id, messageId, leadId, "open"))
            .addAction(0, "Disqualify", openApp(id + 1, messageId, leadId, "disqualify"));

        NotificationManagerCompat manager = NotificationManagerCompat.from(this);
        if (manager.areNotificationsEnabled()) {
            try {
                manager.notify(id, notification.build());
            } catch (SecurityException ignored) {
                // Permission was turned off in the moment since the check above.
            }
        }
    }

    /** The push plugin reports these extras to the admin, which opens the right page. */
    private PendingIntent openApp(int requestCode, String messageId, String leadId, String action) {
        Intent intent = new Intent(this, MainActivity.class)
            .setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP)
            .putExtra("google.message_id", messageId)
            .putExtra("leadId", leadId)
            .putExtra("action", action)
            .putExtra(MainActivity.EXTRA_NOTIFICATION_ID, leadId.hashCode());
        return PendingIntent.getActivity(this, requestCode, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    private Uri soundUri() {
        return Uri.parse(ContentResolver.SCHEME_ANDROID_RESOURCE + "://" + getPackageName() + "/raw/new_lead");
    }

    /** Does nothing if the channel exists: Android locks a channel's sound once it's created. */
    private void createChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "New leads", NotificationManager.IMPORTANCE_HIGH);
        channel.setDescription("Plays a sound when someone books a call.");
        channel.setSound(
            soundUri(),
            new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build()
        );
        channel.enableVibration(true);
        getSystemService(NotificationManager.class).createNotificationChannel(channel);
    }

    private boolean isInForeground() {
        ActivityManager.RunningAppProcessInfo info = new ActivityManager.RunningAppProcessInfo();
        ActivityManager.getMyMemoryState(info);
        return info.importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND;
    }
}
