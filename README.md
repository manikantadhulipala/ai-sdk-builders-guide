# AI SDK Builders Guide: My Practice

My notes and code for the Vercel Builders Guide to the AI SDK.

## Setup

1. Install Node.js 22 or later and pnpm.
2. Install dependencies: `pnpm install`
3. Copy `.env.example` to `.env` and add your AI Gateway key.
4. Run a lesson, for example: `pnpm lesson:01`

## Lessons

- [x] 01: Introduction to LLMs (`lessons/01-intro-llms/`)
- [x] 02: Prompting Fundamentals (`lessons/02-prompting/`)
- [x] 03: Dev setup and environment check (`lessons/03-dev-setup/`)
- [x] 04: Data extraction (`lessons/04-data-extraction/`)
- [x] 05: Model types and performance (`lessons/05-model-types/`)
- [x] 06: Introduction to invisible AI (`lessons/06-invisible-ai/`)
- [x] 07: Text classification (`lessons/07-classification/`)
- [x] 08: Automatic summarization (`lessons/08-summarization/`)
- [x] 09: Structured data extraction (`lessons/09-structured-extraction/`)
- [ ] 10: UI with v0 (bonus: `starter-app/components/event-card.tsx`)
- [x] 11: Basic chatbot (`starter-app/app/api/chat/route.ts`, `starter-app/app/(5-chatbot)/chat/page.tsx`)
- [ ] 12: AI Elements (`starter-app/components/ai-elements/`)
- [x] 13: System prompts (`starter-app/app/api/chat/route.ts`, `instructions`)
- [x] 14: Tool use (`starter-app/app/api/chat/tools.ts`)
- [ ] 15: Multi-step chat and generative UI (`starter-app/app/(5-chatbot)/chat/weather.tsx`)

Lessons 10 to 15 live in the Next.js starter (`starter-app/`), which is the course's starter project. Lesson 03 is ticked after its environment check passes. The other lessons are ticked after a real model run succeeds, which needs billing on the LookIn team.

## Workflow track: Build Durable Workflows

Code lives in `workflow-app/`, the pizza tracker from the Vercel Academy course "Build Durable Workflows" (`workflow-foundations`). Setup steps are in `workflow-app/README.md`. It needs a Resend key in `workflow-app/.env.local`.

- [x] 1.1: Set up the tracker and wrap `next.config.ts` with `withWorkflow` (`workflow-app/next.config.ts`)
- [x] 1.2: First durable step, `sendOrderConfirmation` (`workflow-app/workflows/steps/send-order-confirmation.ts`)
- [x] 1.3: `processOrder` workflow (`workflow-app/workflows/process-order.ts`), started from `POST /api/orders` with `start(processOrder, [order])`
- [x] 1.4: Deployed to Vercel as `pizza-tracker` (root `workflow-app`). Production is live; orders are stored in Neon Postgres.
- [x] Section 3: Kitchen, driver and delivery hooks (`/api/kitchen/ready`, `/api/driver/pickup`, `/api/driver/delivered`)
