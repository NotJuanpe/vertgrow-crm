# Issue #3 — Add & Edit Client

## User Story
As the business owner, I need to create new clients and update their details
so the CRM always reflects my current relationships.

## What to build
Two pages that share the same form component:
- `/clients/new` — create a new client
- `/clients/[id]` — view and edit an existing client, with full history

### Form fields
| Field | Type | Required |
|---|---|---|
| Name | Text | Yes |
| Phone | Text | Yes |
| Email | Text | No |
| Address | Text | No |
| Status | Select: Lead / Active / Inactive | Yes |
| Notes | Textarea | No |

### Client detail page (`/clients/[id]`) also shows:
- List of appointments for this client (date, type, status) — links to appointment
- List of projects for this client (title, status) — links to project
- List of upcoming reminders for this client
- "Delete client" button with a confirmation dialog

## Acceptance Criteria
- [ ] All required fields validated before submit — error shown inline per field
- [ ] Email field validated as a valid email format if filled in
- [ ] Successful create shows a success message and redirects to the client detail page
- [ ] Successful update shows a success message and stays on the page
- [ ] Delete requires a confirmation step ("Are you sure? This cannot be undone")
- [ ] After delete, redirects to `/clients`
- [ ] Client detail page shows appointments, projects, and reminders sections (can be empty)
- [ ] Empty sections show a helpful message (e.g. "No appointments yet")
- [ ] Form is usable on mobile (390px)

## Notes
- Phone is required because it's the primary contact method for this business
- Do not delete related appointments/projects/reminders when a client is deleted — flag them as orphaned or keep them linked (TBD in a later issue)
