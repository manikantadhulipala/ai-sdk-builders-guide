# Starter additions

Custom files for the course's Next.js starter (`vercel/academy-starters`, `ai-sdk/starter`).
Copy them into the starter project at the same paths:

- `lib/model-router.ts`: model selection and in-memory call telemetry (last 100 calls).
- `app/api/model-router/stats/route.ts`: `GET` route that returns the routing stats as JSON.

Run `pnpm dev` in the starter, then open `/api/model-router/stats`.
The per-model latency and cost values are placeholders to replace with measured or published figures.

## Lesson 8: summarization

- `app/(3-summarization)/summarization/actions.ts`: the server action with the final schema.

Wire the button and summary card into the course's `page.tsx`. Copy `summarization-page.patch` into the starter project's root, then run:

```bash
patch -p1 < summarization-page.patch
```

The patch is checked against the course's original file. It adds the `generateSummary` call, the `summary` state, the loading label, and renders `<SummaryCard />` when a summary exists.

## Lesson 9: structured extraction

- `app/(4-extraction)/extraction/schemas.ts`: the appointment schema with `.describe()` guidance and today's date.
- `app/(4-extraction)/extraction/actions.ts`: the server action that calls `generateText` with `Output.object()`.
- `extraction-page.patch`: wires the form and the calendar card into the course's `page.tsx`. Copy it into the starter project's root, then run `patch -p1 < extraction-page.patch`.
