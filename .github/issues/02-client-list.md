# Issue #2 — Client List

## User Story
As the business owner, I need to see all my clients in one place so I can
quickly find who I'm looking for and understand their status at a glance.

## What to build
Page at `/clients`:
- List of all clients showing: name, phone, status badge (Lead / Active / Inactive), and date added
- Search bar that filters clients by name or phone in real time (no page reload)
- Filter by status (All / Lead / Active / Inactive)
- "Add Client" button that navigates to the add client form (Issue #3)
- Clicking a client row navigates to their detail page (Issue #3)
- Empty state: if no clients exist, show a helpful message and the "Add Client" button

## Acceptance Criteria
- [ ] All clients from the database are listed on page load
- [ ] Search filters the list in real time as the user types
- [ ] Status filter shows only clients matching the selected status
- [ ] Search and status filter work together simultaneously
- [ ] Each row shows name, phone, status badge, and date added
- [ ] Status badge has distinct colours: Lead = yellow, Active = green, Inactive = grey
- [ ] Clicking a row opens that client's detail/edit page
- [ ] "Add Client" button is visible and navigates correctly
- [ ] Empty state is shown when no clients match (search/filter) or none exist yet
- [ ] Page is usable on mobile (390px) — rows stack cleanly, search bar is full width

## Notes
- Fetch clients from Supabase via a server component or API route — not client-side fetch on load
- No pagination needed for now — the owner has a small client base
