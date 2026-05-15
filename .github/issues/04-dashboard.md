# Issue #4 — Dashboard

## User Story
As the business owner, I need a home screen that shows me what's happening
today and what needs my attention so I can start my day without digging around.

## What to build
Page at `/dashboard` — the first page seen after login:

### Sections
1. **Today's appointments** — list of appointments scheduled for today (time, client name, type)
2. **Reminders due** — reminders due today or overdue (client name, reminder type, due date)
3. **Quick stats** — 4 summary cards: Total Clients, Active Projects, Appointments This Week, Overdue Reminders
4. **Recent clients** — last 5 clients added or updated, with a link to each

### Interactions
- Clicking an appointment opens it
- Clicking a reminder opens the linked client
- Clicking a stat card navigates to the relevant list page
- "Mark done" button on each reminder to dismiss it without opening the client

## Acceptance Criteria
- [ ] Dashboard loads within 2 seconds on a normal connection
- [ ] Today's appointments are sorted by time (earliest first)
- [ ] Overdue reminders (past due date, not done) appear at the top of the reminders list
- [ ] Quick stats show correct counts from the database
- [ ] "Mark done" on a reminder updates it immediately without a page reload
- [ ] All sections show a friendly empty state when there is no data
- [ ] Page is usable on mobile — sections stack vertically

## Notes
- All data fetched server-side for fast initial load
- "Mark done" is the one client-side interaction — use a server action or API route
