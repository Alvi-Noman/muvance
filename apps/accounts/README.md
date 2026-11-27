# Muvance Account

`https://accounts.muvance.com`: the Muvance account page. One account per person (their
@muvance.com address and one password) signs them in to every app they have: the Admin CRM, Mail,
Chat and Meet. Signing in on any of them signs you in on all (one cookie for the whole domain).

- **Sign in**, then go back to the app you came from (`?continue=https://mail.muvance.com/`).
- **Choose your password**: after signing in with a starting password an admin set.
- **Set password links** (`/set-password?token=…`): admins create them on the People page, for new
  people and for forgotten passwords.
- **Your account**: your apps, your name and picture, change your password (it changes your
  mailbox's too), sign out everywhere.

Admins add people and switch apps on and off in the Admin CRM's People page.

## Develop

```sh
npm run dev   # from the repo root: API on :4000, this app on http://localhost:5178
```
