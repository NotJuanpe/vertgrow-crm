# Issue #6 — Plant Advisor (AI Feature)

## User Story
As the business owner, I need an AI tool that recommends plants for a specific
space based on a photo and site conditions so I can confidently propose designs
even for species I'm less familiar with.

## What to build
Page at `/plant-advisor`:

### Step 1 — Input form
| Field | Type | Required |
|---|---|---|
| Space photo | Image upload (jpg/png, max 10MB) | Yes |
| Climate / location | Text (e.g. "Miami, FL" or "temperate, UK") | Yes |
| Sunlight | Select: Full sun / Partial sun / Shade | Yes |
| Style | Select: Tropical / Minimal / Colourful / Native / Edible | Yes |
| Maintenance level | Select: Low / Medium / High | Yes |
| Dimensions | Two number inputs: height (m) × width (m) | No |
| Extra notes | Textarea (e.g. "needs to hide a wall", "client has dogs") | No |

### Step 2 — Results
After submission, display:
- A brief design note (1–2 sentences overview)
- A card for each recommended plant (5–8 plants) showing:
  - Common name + scientific name
  - Why it suits this space
  - Care difficulty badge (Easy / Moderate / Demanding)
  - Pairing note (works well with the other recommended plants)

### Step 3 — Save to project
- "Save to Project" button — dropdown to select an existing project
- Saves the approved plant list to `project_plants` table
- Shows confirmation when saved

## Acceptance Criteria
- [ ] Form validates that photo and all required fields are filled before submitting
- [ ] Photo preview shown after upload (before submit)
- [ ] Loading state shown while waiting for Claude response (can take 5–10 seconds)
- [ ] Results display all 5–8 plants with all four fields per plant
- [ ] "Save to Project" saves each plant to `project_plants` linked to the selected project
- [ ] If the Claude API call fails, a clear error message is shown (not a blank screen)
- [ ] ANTHROPIC_API_KEY is never exposed in client-side code
- [ ] Page is usable on mobile (390px)

## Technical notes
- API route: `/app/api/ai/plant-advisor/route.ts`
- Model: `claude-sonnet-4-6` (vision required)
- Image must be sent as base64-encoded content in the Claude API messages array
- Parse the Claude response into structured JSON before returning to the frontend
- See CLAUDE.md → AI Features section for full implementation rules
