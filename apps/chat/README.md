# Muvance Chat

Team and client conversations at `https://chat.muvance.com`, in the style of Google Chat.

- **Spaces:** group conversations for a project or a client. Teammates create them, add teammates,
  and invite clients by email. A space can be findable by the whole team (Browse spaces).
- **Direct messages** between two people.
- **Threads** (reply to a message), **reactions**, **@mentions** (`@all` in spaces), editing and
  deleting, formatting (`*bold*`, `_italic_`, `~strike~`, `` `code` ``, ` ``` ` blocks), links.
- **Files and pictures** up to 25 MB, by button, drag and drop, or paste.
- **Live:** new messages, typing, who's online and "Seen" (direct messages) arrive instantly.
- **Unread counts**, desktop notifications and a sound; mute per conversation.
- **Search** across messages and file names.

## Who can sign in

- **Team:** their @muvance.com email and its password (the mailbox from the admin's Email page).
- **Clients (guests):** the email they were invited with, and the password they chose from the
  invite link. They see only the spaces they're in. Teammates can send a new link (lost invite,
  forgotten password) or remove access in Settings → Guests.

## Develop

```sh
npm run dev   # from the repo root: API on :4000, this app on http://localhost:5177
```

The API module is `apps/api/src/modules/chat`; its tests are `apps/api/tests/chat.test.ts`.
