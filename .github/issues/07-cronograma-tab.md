# Issue #7 — Cronograma Tab (Project Timeline / Gantt View)

## User Story
As the business owner, I need a timeline view of each project's phases so I
can see at a glance how the schedule is progressing and communicate deadlines
to clients and crew.

## What to build
Page / tab at the `Cronograma` nav link (currently visible but empty):

- A Gantt-style timeline for a selected project
- Each row = one project phase (e.g. Design, Procurement, Installation, Finishing)
- Each phase shows: start date, end date, duration in days, and current status
- Phases can be created, edited, and deleted per project
- Clicking a phase opens an inline edit form: name, start date, end date, status, notes
- A date-range header scrolls horizontally with the timeline bars
- A project selector at the top to switch between active projects

## Acceptance Criteria
- [ ] `Cronograma` nav link renders content (not blank)
- [ ] User can select any active project from a dropdown
- [ ] Timeline renders one horizontal bar per phase, scaled to real calendar dates
- [ ] Bars are color-coded by status (Pending / In Progress / Done)
- [ ] User can add a new phase with name, start date, end date
- [ ] User can edit any phase inline without leaving the page
- [ ] User can delete a phase with a confirmation prompt
- [ ] Today's date is marked with a vertical line on the timeline
- [ ] Timeline is scrollable horizontally for projects spanning more than 4 weeks
- [ ] View is usable on a 1280px desktop screen (mobile is out of scope for now)

## Edge cases
- A project with no phases should show an empty state with an "Add first phase" call to action
- Overlapping phases (same date range) should both be visible, not hidden behind each other
- Phases where end date < start date should be rejected with a validation error
- Projects that span more than 6 months should not break the horizontal scroll

## Out of scope
- Drag-to-resize or drag-to-move bars (mouse-drag interactions)
- Dependencies between phases (phase B can't start until phase A is done)
- Exporting the Gantt as a PDF or image (can be a follow-up issue)
- Integration with the Operativo kanban board (separate concern)
