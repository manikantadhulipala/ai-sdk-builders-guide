import {
  streamText,
  convertToModelMessages,
  createUIMessageStreamResponse,
  toUIMessageStream,
  isStepCount,
} from "ai";
import { getMemoryStore, saveMemoryStore } from "@/lib/memory";
import { getWeather } from "./tools";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// System prompt: the assistant's persistent persona and constraints for every reply.
// (In AI SDK v7 this property is called `instructions`; it was `system` before.)
const PERSONA = `You are a support assistant for TechCorp's cloud platform.
Focus on helping users troubleshoot deployment issues, API usage, and account settings.
Be concise but thorough. Link to documentation at docs.techcorp.com when relevant.
If a question is outside your knowledge area, politely redirect to contact@techcorp.com.
When using tools, only mention capabilities you actually have. The weather tool provides current temperature, conditions, and humidity only - no forecasts.`;

type IncomingMessage = { role: string; parts?: { type: string; text?: string }[] };

function textOf(message: IncomingMessage | undefined): string {
  return message?.parts?.filter((p) => p.type === "text").map((p) => p.text ?? "").join(" ").trim() ?? "";
}

export async function POST(req: Request) {
  try {
    const { messages, persona = "default" } = (await req.json()) as {
      messages: IncomingMessage[];
      persona?: string;
    };

    const store = getMemoryStore();
    const userText = textOf([...messages].reverse().find((m) => m.role === "user"));

    // Memory is optional: if retrieval fails (for example, no embedding access), chat still works.
    let memoryContext: string | undefined;
    try {
      if (userText) {
        const found = await store.retrieveMemories(persona, userText, 3);
        if (found.length > 0) {
          memoryContext = "Relevant earlier context from this user:\n" + found.map((m) => `- ${m.message}`).join("\n");
        }
      }
    } catch (error) {
      console.warn("Memory retrieval skipped:", error instanceof Error ? error.message : error);
    }

    const result = streamText({
      model: "openai/gpt-5-mini", // Fast model for real-time chat (immediate streaming, low latency)
      instructions: [PERSONA, memoryContext].filter(Boolean).join("\n\n"),
      messages: await convertToModelMessages(messages as never),
      tools: { getWeather },
      stopWhen: isStepCount(5), // Allow up to 5 steps: tool calls, then a written answer
      onFinish: async () => {
        // Save the user's message only after the reply succeeds.
        if (!userText) return;
        try {
          await store.registerMemory(persona, userText, "");
          saveMemoryStore();
        } catch (error) {
          console.warn("Memory save skipped:", error instanceof Error ? error.message : error);
        }
      },
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
    });
  } catch (error) {
    console.error("Chat API error:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
