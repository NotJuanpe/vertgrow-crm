# /plant-advisor-test

Run a test call to the Plant Advisor feature to verify it's working.

## What this does
1. Check that ANTHROPIC_API_KEY is set in .env.local
2. Look at the current implementation in /app/api/ai/plant-advisor/route.ts
3. Run a test with a sample payload:
   - Use any small image from /public or a placeholder URL
   - Parameters: partial sun, tropical style, low maintenance, 2m x 3m, temperate climate
4. Print the full response from Claude
5. Flag any errors in the API route, missing env vars, or unexpected output format

## Use this when
- Setting up the project for the first time
- After making changes to the plant advisor prompt or logic
- Debugging unexpected plant advisor behaviour
