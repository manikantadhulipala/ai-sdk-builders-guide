# Starter additions

Custom files for the course's Next.js starter (`vercel/academy-starters`, `ai-sdk/starter`).
Copy them into the starter project at the same paths:

- `lib/model-router.ts`: model selection and in-memory call telemetry (last 100 calls).
- `app/api/model-router/stats/route.ts`: `GET` route that returns the routing stats as JSON.

Run `pnpm dev` in the starter, then open `/api/model-router/stats`.
The per-model latency and cost values are placeholders to replace with measured or published figures.

## Lesson 8: summarization

- `app/(3-summarization)/summarization/actions.ts`: the server action with the final schema.

Wire it into the course's `page.tsx` in the same folder, as the lesson describes: import `generateSummary`, add the `summary` state, call the action from the Summarize button, and render `<SummaryCard {...summary} />` when there is a summary.
