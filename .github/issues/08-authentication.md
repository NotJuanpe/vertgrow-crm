# Issue #8 — Authentication & Basic Access Control

## User Story
As the business owner, I need the app to require a password so that if the
server is ever accessible on a local network or the internet, no one else can
read or modify my client data.

## What to build
A minimal login layer in front of the entire app:

- A login screen that appears before any other tab is shown
- Single-user authentication: one fixed username + password (configurable via
  environment variables, not hardcoded)
- On successful login, the session persists for 8 hours (stored in a
  server-side session or a signed cookie)
- A logout button accessible from the main navigation
- All API routes (`/api/*`) must reject requests that do not carry a valid
  session token with HTTP 401

### Backend changes
- Add `express-session` (or equivalent) to `server/server.js`
- Add `POST /api/auth/login` and `POST /api/auth/logout` routes
- Add session middleware that guards every existing API route
- Credentials loaded from `server/.env`: `APP_USER` and `APP_PASSWORD`

### Frontend changes (index.html)
- Render a full-screen login form when the API returns 401
- On successful login, hide the login form and show the main app
- Add a "Logout" button to the top navigation bar

## Acceptance Criteria
- [ ] Visiting the app without a session shows only the login form
- [ ] Correct credentials grant access and hide the login form
- [ ] Wrong credentials show an error message; the form is not cleared
- [ ] All `fetch()` calls in `index.html` that receive a 401 redirect to the login screen without a full page reload
- [ ] Session expires after 8 hours of inactivity and shows the login screen
- [ ] Logout button ends the session server-side and returns to the login form
- [ ] `APP_USER` and `APP_PASSWORD` are read from `server/.env` — never hardcoded
- [ ] `.env` is listed in `.gitignore`
- [ ] CORS is still locked to `localhost` only (no change to current policy)

## Edge cases
- If the server restarts, all sessions are invalidated — users must log in again (acceptable)
- Simultaneous logins from two browser tabs should both work without conflict
- Empty username or password fields should be caught client-side before the API call

## Out of scope
- Multi-user support or role-based permissions
- OAuth / social login
- Password reset flow (password is changed directly in `.env`)
- HTTPS / TLS setup (assumes the app stays on localhost for now)
