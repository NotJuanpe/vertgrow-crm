# /new-feature

Build a new feature from a GitHub issue.

## Usage
/new-feature <issue-number>

## What this does
1. Fetch the GitHub issue by number and read it fully
2. Identify which modules are affected (clients, appointments, projects, plant-advisor, etc.)
3. Check existing components in /components and existing API routes in /app/api before creating anything new
4. If the feature needs new database tables or columns, write a migration in /supabase/migrations/ first
5. Build the API route(s) in /app/api/
6. Build the UI components and page(s)
7. Wire them together
8. List what was built and flag anything that needs manual testing

## Rules
- Never expose ANTHROPIC_API_KEY or SUPABASE_SERVICE_ROLE_KEY in client-side code
- Follow the conventions in CLAUDE.md — read it if you haven't already
- If anything in the issue is ambiguous, stop and ask before building
- Mobile-first — check that the UI works at 390px width
