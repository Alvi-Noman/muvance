# Muvance Chat

Team and client conversations at `https://chat.muvance.com`, in the style of Google Chat.

- **Spaces:** group conversations for a project or a client. Teammates create them, add teammates,
  and invite clients by email. A space can be findable by the whole team (Browse spaces).
- **Direct messages** between two people.
- **Threads** (reply to a message), **quote in reply**, **reactions**, **@mentions** (`@all` in
  spaces), editing and deleting, formatting (`*bold*`, `_italic_`, `~strike~`, `` `code` ``,
  ` ``` ` blocks), and **link previews** (title, description and picture of the first link).
- **Media:** photos and videos (shown in a grid, opened full screen with swipe and zoom), **voice
  messages** (recorded in the app, with a waveform and 1×/1.5×/2× playback), audio, and any file up
  to 100 MB, by the + menu (photos, camera on phones, files), drag and drop, or paste.
- **Shared in this conversation:** every photo, video, file, link and pinned message in one panel.
- **Pin** messages for everyone in a conversation; **save** messages for yourself (Saved);
  **forward** a message (with its files) to other conversations; **mark as unread**.
- **Status** ("📅 In a meeting", clears by itself) and **Do not disturb** (pauses notifications).
- **Live:** new messages, typing, who's online and "Seen" (direct messages) arrive instantly.
- **Notifications:** push notifications on computers and phones, even with the app closed
  (standard Web Push; the keys are made by the API and kept in MongoDB), unread counts on the tab
  and the app icon, a sound; mute per conversation.
- **Search** across messages and file names.
- **Phones:** hold a message for its actions; installable as an app (Android app in
  `apps/chat-app`, or Add to Home Screen on iPhone); "Share to Muvance Chat" from other apps when
  installed from Chrome.

## Who can sign in

- **Team:** their @muvance.com email and its password (the mailbox from the admin's Email page).
- **Clients (guests):** the email they were invited with, and the password they chose from the
  invite link. They see only the spaces they're in. Teammates can send a new link (lost invite,
  forgotten password) or remove access in Settings → Guests.

## Where things are kept

Messages, people, spaces, reactions, pins and saved messages are in **MongoDB** (the same database
as the rest of Muvance; collections starting with `chat`). Shared files are on the server's disk
(`/opt/muvance/chat-files`, `CHAT_FILES_DIR`), one file per upload.

## Develop

```sh
npm run dev   # from the repo root: API on :4000, this app on http://localhost:5177
```

The API module is `apps/api/src/modules/chat`; its tests are `apps/api/tests/chat.test.ts` and
`chat-advanced.test.ts`.
