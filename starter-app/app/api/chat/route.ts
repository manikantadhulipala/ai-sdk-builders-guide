import {
  streamText,
  convertToModelMessages,
  createUIMessageStreamResponse,
  toUIMessageStream,
} from "ai";
import { getMemoryStore, saveMemoryStore } from "@/lib/memory";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

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
    let system: string | undefined;
    try {
      if (userText) {
        const found = await store.retrieveMemories(persona, userText, 3);
        if (found.length > 0) {
          system = "Relevant earlier context from this user:\n" + found.map((m) => `- ${m.message}`).join("\n");
        }
      }
    } catch (error) {
      console.warn("Memory retrieval skipped:", error instanceof Error ? error.message : error);
    }

    const result = streamText({
      model: "openai/gpt-5-mini", // Fast model for real-time chat (immediate streaming, low latency)
      system,
      messages: await convertToModelMessages(messages as never),
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
