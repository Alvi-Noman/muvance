# Muvance Meet Android app

An Android shell around the live meetings site (`https://meet.muvance.com`), so normal meet changes
reach the app when they deploy. What only the app adds: **presenting your phone's screen**, which
browsers on Android can't do.

Download: https://meet.muvance.com/downloads/muvance-meet.apk

## How presenting works

The call runs in the web page as usual. Pressing Present in the app:

1. asks the API for a screen token (`POST /api/meet/rooms/:code/screen-token`), proving you're in
   the call with the token you joined with;
2. shows Android's "Start recording or casting?" prompt;
3. joins the call a second time, natively, with LiveKit's Android SDK, sharing only the screen
   (`ScreenSharePlugin.kt`).

That second participant's metadata names whose screen it is (`screenOf`), so the call shows it as
your presentation, and leaves it out of the people list, counts and the size limit.

While you present, the call keeps your microphone on from the background: LiveKit's screen capture
service is also declared as a microphone service in `AndroidManifest.xml`, and the app asks for the
microphone before presenting.

## Build the install file

Needs Docker, and no Java or Android tools:

```sh
bash apps/meet-app/build-apk.sh
```

The signed file lands at `~/muvance-meet.apk`, and is copied to `apps/meet/public/downloads/`.
Commit and push that file to update the public download.

It's signed with the same key as the CRM app (`~/muvance-android.keystore`, see
`apps/mobile/README.md`). **Back it up**: without it, phones can't update the app.

To release a change to the app itself (icon, name, native code), raise `versionCode` in
`android/app/build.gradle` and build again. Changes to the meetings site need no new app.
