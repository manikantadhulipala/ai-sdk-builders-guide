# Reflections

These are drafts. Each reflection is meant to be your own thinking, so replace the
bracketed parts with your experience before you save or share them.

## Lesson 1: Introduction to LLMs

**Prompt:** After exploring the OpenAI tokenizer tool, what surprised you most about how text gets split into tokens? How will this impact your prompt design and handling of large documents?

**Draft:** [Describe what you saw in the tokenizer.] Measured with the `o200k_base` tokenizer (`pnpm lesson:04:tokens` uses the same library): a common word like `the` is 1 token, `Kubernetes` is 2, `extraordinarily` is 3, the number `12345` is 2, the date `2026-11-20` is 6, and an emoji `🚀` is 2. The surprise for me is [your reaction, e.g. how much a date costs compared with a word]. This matters for cost and the context window, because limits are counted in tokens, not words. For large documents I would chunk or summarise the text before sending it, and keep prompts short and specific.

## Lesson 2: Prompting Fundamentals

**Prompt:** Think about a specific feature you might build using the AI SDK. Which prompting technique (zero-shot, few-shot, or chain-of-thought) seems most appropriate, and why? How would you iterate on the prompt if the first results were not what you expected?

**Draft:** [Name a feature.] I would use [technique] because [reason]. If the results were off, I would change one thing at a time, such as adding a worked example or tightening the output format, and compare outputs across a few runs using the consistency test in `lessons/04-data-extraction/few-shot-extraction.ts`.

## Lesson 4: Data Extraction

**Prompt:** What surprised you most when changing prompts vs models? How does this hands-on experience change how you think about working with AI?

**Draft:** [Fill in after a real run of `pnpm lesson:04` and `pnpm lesson:04:summary`, since billing currently blocks real output.] Changing the prompt changed the task itself, while changing the model mostly changed quality, speed, and cost. Iteration is the main way to improve results.

## Lesson 5: Model Types and Performance

**Prompt:** Think about an AI feature you would like to build. What type of interactions would it have? Would users expect immediate responses, or would they accept a delay for better quality? Which model type would you choose and why?

**Draft:** [Describe your feature.] Users of [feature] would expect [immediate / delayed] responses, so I would choose [fast / reasoning] model because [reason]. For the slower option I would show a loading state with a time estimate.

## Lesson 6: Introduction to Invisible AI

**Prompt:** What apps do you use with hidden AI features? Identify one or two examples. How do they improve UX? How could you build something similar with the AI SDK?

**Draft:** [Name one or two apps you use.] For example, [app] does [feature] without asking me, which cuts out a manual step. I could build something similar with `generateText` and `Output.object()`, for example by turning free-text input into a typed form.

**Optional-vs-nullable note (from the lesson's challenge):** use `.nullable()` when a field should always be present in the output but can be `null`, as with `suggestedResponse` in `lessons/06-invisible-ai/demo.ts`. Use `.optional()` when the key itself may be absent. With `Output.object()`, `.nullable()` gives the model a consistent shape to fill in, which is usually easier to validate.
