package com.muvance.admin;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    static final String EXTRA_NOTIFICATION_ID = "notificationId";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Android draws apps behind the status and navigation bars. The admin is a normal web page,
        // so keep it clear of them, and of the keyboard while typing.
        View content = findViewById(android.R.id.content);
        content.setBackgroundColor(getColor(R.color.ic_launcher_background));
        ViewCompat.setOnApplyWindowInsetsListener(content, (view, windowInsets) -> {
            Insets insets = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.ime());
            view.setPadding(insets.left, insets.top, insets.right, insets.bottom);
            return WindowInsetsCompat.CONSUMED;
        });

        dismissNotification(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        dismissNotification(intent);
    }

    /** Tapping a notification's button doesn't close the notification by itself. */
    private void dismissNotification(Intent intent) {
        if (intent != null && intent.hasExtra(EXTRA_NOTIFICATION_ID)) {
            NotificationManagerCompat.from(this).cancel(intent.getIntExtra(EXTRA_NOTIFICATION_ID, 0));
        }
    }
}
