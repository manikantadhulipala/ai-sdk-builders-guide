// Offline check for the memory service. Uses a local bag-of-words embedder, so it
// needs no model call or billing. Run with: pnpm tsx lib/memory/memory-check.ts
import { MemoryStore, type Embedder } from "./memory-service";

const VOCAB = [
  "refund", "invoice", "billing", "charge", "password", "login", "reset",
  "export", "crash", "bug", "dark", "mode", "feature", "design", "meeting",
];

// Hashed bag-of-words: one dimension per vocabulary word.
const localEmbedder: Embedder = async (text) => {
  const words = text.toLowerCase().split(/[^a-z]+/);
  return VOCAB.map((w) => (words.includes(w) ? 1 : 0));
};

async function main() {
  const DAY = 86_400_000;
  const now = Date.now();
  const store = new MemoryStore(localEmbedder);
  store.configure("support", { halfLifeDays: 30 });
  store.configure("designer", { halfLifeDays: 30 });

  await store.registerMemory("support", "I was charged twice on my invoice", "billing issue", now - 2 * DAY);
  await store.registerMemory("support", "Login fails after password reset", "login issue", now - 1 * DAY);
  await store.registerMemory("designer", "Please add dark mode to the design", "feature request", now);

  const billing = await store.retrieveMemories("support", "refund for a double charge", 2, now);
  console.log("support -> billing query:", billing.map((m) => m.message));

  const isolated = await store.retrieveMemories("designer", "refund for a double charge", 5, now);
  console.log("designer memories for billing query:", isolated.map((m) => m.message));

  // Decay: the same message, one day old vs 90 days old.
  store.configure("aging", { halfLifeDays: 30 });
  await store.registerMemory("aging", "crash when I export the file", "", now - 90 * DAY);
  await store.registerMemory("aging", "crash when I export the file again", "", now - 1 * DAY);
  const ranked = await store.retrieveMemories("aging", "export crash", 2, now);
  console.log("decay order (newest first):", ranked.map((m) => m.message));

  store.setSummary("support", "Customer had a double charge and a login problem.");
  console.log("summary kept per persona:", store.getSummary("support"));
}

main().catch((error) => {
  console.error("❌ Memory check failed:", error);
  process.exit(1);
});
