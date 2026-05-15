# Issue #1 — Project Setup & Authentication

## User Story
As the business owner, I need to log into the CRM securely so that my client
data is private and only accessible to me.

## What to build
- Initialize Next.js 14 (App Router) with TypeScript and Tailwind CSS
- Connect Supabase (database + auth)
- Login page at `/login` — email and password only
- After login, redirect to `/dashboard`
- If not logged in, all routes redirect to `/login`
- Logout button accessible from every page (header or sidebar)
- Basic layout shell: sidebar navigation with links to Dashboard, Clients, Appointments, Projects, Plant Advisor

## Acceptance Criteria
- [ ] Visiting any route while logged out redirects to `/login`
- [ ] Valid credentials log the user in and redirect to `/dashboard`
- [ ] Invalid credentials show a clear error message (not a console error)
- [ ] Logout clears the session and redirects to `/login`
- [ ] Layout sidebar is visible on all authenticated pages
- [ ] Layout is usable on mobile (390px width) — sidebar collapses or becomes a bottom nav

## Notes
- Use Supabase Auth (email/password) — no OAuth needed for now
- The `.env.local` file must be documented in the README with the required variable names (no actual values)
- No sign-up page — the owner creates his own account directly in the Supabase dashboard
