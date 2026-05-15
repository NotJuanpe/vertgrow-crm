# Issue #5 — Appointments

## User Story
As the business owner, I need to schedule and track appointments with clients
so I never miss a visit or lose track of what was discussed.

## What to build
Page at `/appointments`:
- List view of all upcoming appointments (default) and a toggle for past appointments
- Each row: date + time, client name, type badge, status badge, notes preview
- "New Appointment" button
- Click a row to open the appointment detail/edit view

### Appointment form (create + edit)
| Field | Type | Required |
|---|---|---|
| Client | Select (search by name) | Yes |
| Date | Date picker | Yes |
| Time | Time picker | Yes |
| Duration | Select: 30min / 1h / 2h / Half day / Full day | Yes |
| Type | Select: Quote / Installation / Maintenance / Follow-up | Yes |
| Status | Select: Scheduled / Completed / Cancelled | Yes |
| Notes | Textarea | No |

### From the appointment detail page
- "Add Reminder" — creates a reminder linked to this appointment
- "Link to Project" — associate the appointment with an existing project

## Acceptance Criteria
- [ ] Upcoming appointments shown by default, sorted by date ascending
- [ ] Toggle to show past appointments (completed or cancelled)
- [ ] New appointment form validates all required fields before submit
- [ ] Client selector searches clients by name as the user types
- [ ] Successful create redirects to the appointment detail page
- [ ] Status can be updated from the detail page without re-opening the form
- [ ] Appointment appears on the dashboard under "Today's appointments" when date = today
- [ ] Page is usable on mobile (390px)

## Notes
- No calendar view in this issue — list view only for now, calendar can be a follow-up issue
- Duration is a select, not a calculated field, to keep it simple
