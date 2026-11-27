# Muvance Chat Android app

The Android app for `https://chat.muvance.com`. It's a Trusted Web Activity: the app opens the chat
site full screen in the phone's Chrome engine. So everything works as on the website (push
notifications, voice messages, the camera, file uploads and downloads), and chat changes reach the
app as soon as they deploy, with no new version.

Download: https://chat.muvance.com/downloads/muvance-chat.apk (also in the chat under your picture →
Get the app).

## How it opens full screen

Android checks `https://chat.muvance.com/.well-known/assetlinks.json`
(`apps/chat/public/.well-known/assetlinks.json`) for the app's signing certificate. If it matches,
there's no address bar. If it doesn't (for example, a different signing key), the app still works
but shows a small address bar at the top.

Notifications: Chrome hands the site's notifications to the app (`DelegationService`), so they show
with Muvance Chat's name and icon. The first time, the app asks to allow notifications.

Phones without Chrome (or another browser that supports this) use a built-in web view instead, which
has no push notifications.

## Build the install file

Needs Docker, and no Java or Android tools:

```sh
bash apps/chat-app/build-apk.sh
```

The signed file lands at `~/muvance-chat.apk`, and is copied to `apps/chat/public/downloads/`.
Commit and push that file to update the public download.

It's signed with the same key as the other Muvance apps (`~/muvance-android.keystore`, see
`apps/mobile/README.md`). **Back it up**: without it, phones can't update the app, and the
fingerprint in `assetlinks.json` must match it.

To release a change to the app itself (icon, name), raise `versionCode` in
`android/app/build.gradle` and build again.
