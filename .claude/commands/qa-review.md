# /qa-review

Review a completed feature against its original spec.

## Usage
/qa-review <issue-number>

## What this does
1. Fetch the GitHub issue and extract the acceptance criteria
2. Read the code that was written to implement it (trace from the page/component back through API routes to the DB)
3. For each acceptance criterion, check whether the implementation actually satisfies it
4. Check for:
   - Missing error handling (what happens if the API call fails?)
   - Missing loading states (does the UI show feedback while waiting?)
   - Mobile layout issues (is it usable at 390px width?)
   - Hardcoded values that should be dynamic
   - Any direct DB queries outside of /lib/supabase/
   - Any Claude API calls outside of /app/api/ or /lib/claude/
5. Produce a report:
   - PASS / FAIL per acceptance criterion
   - List of issues found with file:line references
   - Suggested fixes for anything that failed

## Note for the QA engineer
This command is your primary tool. Run it after every feature build before
marking the issue closed.
