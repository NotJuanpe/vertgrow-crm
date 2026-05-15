# VertGrow CRM — Project Brief

## What this is
A CRM built for a solo vertical gardening operator. It handles the full client lifecycle
(leads → appointments → projects → follow-ups) and includes an AI-powered plant advisor
that recommends plants based on photos and site parameters.

## Who uses it
- **Primary user:** The business owner — manages clients, schedules, and projects solo
- **Not a multi-tenant SaaS** — single-user app, no client-facing portal (yet)

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database + Auth + Storage | Supabase |
| Styling | Tailwind CSS |
| AI features | Claude API (claude-sonnet-4-6) |
| Deployment | Vercel |

**Never introduce new dependencies without a clear reason.** If a feature can be built
with what's already in the stack, do it that way.

---

## Project Structure

```
/app                    # Next.js App Router pages
  /dashboard            # Main CRM view
  /clients              # Client management
  /appointments         # Scheduling
  /projects             # Active gardening projects
  /plant-advisor        # AI plant recommendation tool
  /api                  # API routes (server-side only)
    /ai                 # Claude API calls go here, never client-side
/components             # Reusable UI components
/lib
  /supabase             # Supabase client + types
  /claude               # Claude API wrapper
  /utils                # Shared helpers
/supabase
  /migrations           # SQL migrations — never edit the DB directly
```

---

## Core Modules

### 1. Clients
- Name, contact info, address, notes
- Status: lead → active → inactive
- Full history of appointments and projects per client

### 2. Appointments
- Linked to a client
- Date, time, duration, type (quote / install / maintenance)
- Status: scheduled → completed → cancelled
- Notes field for visit observations

### 3. Reminders
- Can be attached to a client or appointment
- Types: follow-up call, seasonal maintenance, quote expiry
- Displayed on the dashboard as a daily digest

### 4. Projects
- Linked to a client
- Has a plant list (populated manually or via the Plant Advisor)
- Status: planning → in progress → completed
- Photo gallery (stored in Supabase Storage)

---

## AI Features

### Plant Advisor
The centrepiece AI feature. Lives at `/plant-advisor`.

**How it works:**
1. User uploads a photo of the space (wall, balcony, indoor area)
2. User fills in parameters:
   - Location / climate zone
   - Sunlight: full sun / partial / shade
   - Style: tropical / minimal / colourful / native / edible
   - Maintenance level: low / medium / high
   - Approximate dimensions (height × width in metres)
3. Claude receives the photo + parameters and returns:
   - A curated list of 5–8 plants
   - For each plant: common name, scientific name, why it suits this space,
     care difficulty, and whether it pairs well with the others
   - A brief overall design note

**Implementation rules:**
- Claude API calls happen in `/app/api/ai/plant-advisor/route.ts` — never in client components
- Use `claude-sonnet-4-6` — this feature requires vision + complex reasoning
- Always include the image as a base64-encoded vision input
- Store the result in the project's plant list if the user approves it

---

## Database — Key Tables

```sql
clients         (id, name, email, phone, address, status, notes, created_at)
appointments    (id, client_id, date, duration_min, type, status, notes)
reminders       (id, client_id, appointment_id, due_date, type, done)
projects        (id, client_id, title, status, dimensions, notes, created_at)
project_plants  (id, project_id, common_name, scientific_name, notes, approved)
project_photos  (id, project_id, storage_path, uploaded_at)
```

Migrations live in `/supabase/migrations/`. Always add a new migration file —
never alter an existing one.

---

## Coding Conventions

- TypeScript strict mode — no `any`
- Server Components by default; use `'use client'` only when you need interactivity
- All Supabase queries go through `/lib/supabase/` — no raw queries in components
- All Claude API calls go through `/lib/claude/` — never expose the API key client-side
- Forms use controlled inputs with validation before submission
- Error states must always be handled and shown to the user — no silent failures
- Mobile-first responsive design — the owner uses this on his phone on job sites

---

## Model Selection for AI Features

When building any feature that calls the Claude API, pick the model based on the task:

| Task type | Model |
|---|---|
| Vision input (photos) | `claude-sonnet-4-6` |
| Complex reasoning, recommendations | `claude-sonnet-4-6` |
| Simple text generation (reminders, summaries, short copy) | `claude-haiku-4-5-20251001` |
| Structured data extraction from text | `claude-haiku-4-5-20251001` |

Default to Haiku unless the task genuinely needs vision or multi-step reasoning.
Haiku is ~10x cheaper and fast enough for simple tasks.

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY      # server-side only
ANTHROPIC_API_KEY              # server-side only, never expose to client
```

These go in `.env.local` (never committed). Vercel has them set in the dashboard.

---

## How to Work on This Project

This project is built feature by feature using GitHub Issues as specs.
Each issue describes exactly what to build, the acceptance criteria, and edge cases.

**When asked to build a feature:**
1. Read the linked GitHub issue fully before writing any code
2. Check existing components in `/components` before creating new ones
3. Follow the DB schema — add a migration if new tables or columns are needed
4. Build the API route first, then the UI
5. Test the happy path and at least one error case before marking done

**When something is unclear:** ask before assuming. A wrong assumption means
rework. One clarifying question is always faster.

---

## Agents (Custom Slash Commands)

Three slash commands live in `.claude/commands/`:

- `/new-feature` — reads a GitHub issue number, plans the implementation, and builds it
- `/plant-advisor-test` — runs a test call to the plant advisor with a sample image
- `/qa-review` — checks a completed feature against its issue's acceptance criteria

---

## Out of Scope (for now)
- Client-facing portal
- Invoicing / payments
- Mobile native app
- Multi-user / team access
- Google Calendar sync
