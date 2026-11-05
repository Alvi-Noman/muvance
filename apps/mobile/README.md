# Muvance Android app

An Android shell around the live admin (`https://admin.muvance.com`), so normal admin changes reach
the app when they deploy. What only the app adds: a push notification with a custom sound when
someone books a call.

## Build the install file

Needs Docker, and no Java or Android tools:

```sh
bash apps/mobile/build-apk.sh
```

The signed file lands at `~/muvance-admin.apk`. Install it by opening it on the phone.

To release a change to the app itself (icon, sound, name, native code), raise `versionCode` in
`android/app/build.gradle` and build again. Phones can install it over the old version.

## Files that stay out of git

| File                               | What it is                                   |
| ---------------------------------- | -------------------------------------------- |
| `android/app/google-services.json` | Connects the app to Firebase (`muvance-crm`) |
| `~/muvance-android.keystore`       | Signing key                                  |
| `~/muvance-android.secret`         | The signing key's password                   |

**Back up the signing key and its password.** Without them, phones can't update the app and must
uninstall and reinstall it.

## On the server

The API sends pushes when `FIREBASE_SERVICE_ACCOUNT` is set in `/opt/muvance/runtime/api.env`, as the
Firebase service account JSON in base64. Without it, bookings work as normal and no alerts are sent.

## The notification sound

`android/app/src/main/res/raw/new_lead.wav` plays when the app is in the background, and
`apps/admin/public/sounds/new-lead.wav` plays when it's open. Android locks a channel's sound the
first time it's created, so to change it, also rename the file and the channel in
`apps/admin/src/features/notifications/push.ts` and
`apps/api/src/modules/devices/devices.service.ts`.
