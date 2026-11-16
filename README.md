# AI SDK Builders Guide: My Practice

My notes and code for the Vercel Builders Guide to the AI SDK.

## Setup

1. Install Node.js 22 or later and pnpm.
2. Install dependencies: `pnpm install`
3. Copy `.env.example` to `.env` and add your AI Gateway key.
4. Run a lesson, for example: `pnpm lesson:01`

## Lessons

- [ ] 01: Introduction to LLMs (`lessons/01-intro-llms/`)
- [ ] 02: Prompting Fundamentals (`lessons/02-prompting/`)
- [x] 03: Dev setup and environment check (`lessons/03-dev-setup/`)
- [ ] 04: Data extraction (`lessons/04-data-extraction/`)
- [ ] 05: Model types and performance (`lessons/05-model-types/`)
- [ ] 06: Introduction to invisible AI (`lessons/06-invisible-ai/`)
- [ ] 07: Text classification (`lessons/07-classification/`)
- [ ] 08: Automatic summarization (`lessons/08-summarization/`)
- [ ] 09: Structured data extraction (`lessons/09-structured-extraction/`)
- [ ] 10: UI with v0 (bonus: `starter-app/components/event-card.tsx`)
- [ ] 11: Basic chatbot (`starter-app/app/api/chat/route.ts`, `starter-app/app/(5-chatbot)/chat/page.tsx`)
- [ ] 12: AI Elements (`starter-app/components/ai-elements/`)
- [ ] 13: System prompts (`starter-app/app/api/chat/route.ts`, `instructions`)
- [ ] 14: Tool use (`starter-app/app/api/chat/tools.ts`)
- [ ] 15: Multi-step chat and generative UI (`starter-app/app/(5-chatbot)/chat/weather.tsx`)

Lessons 10 to 15 live in the Next.js starter (`starter-app/`), which is the course's starter project. Lesson 03 is ticked after its environment check passes. The other lessons are ticked after a real model run succeeds, which needs billing on the LookIn team.
