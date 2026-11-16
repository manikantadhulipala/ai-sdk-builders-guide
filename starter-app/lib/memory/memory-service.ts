import { embed } from "ai";

// Long-term memory for the chatbot: one isolated store per persona, with
// embeddings for retrieval and an exponential decay so older memories fade.

export type Embedder = (text: string) => Promise<number[]>;

// Default embedder: the AI Gateway. Needs billing on the team account.
export const gatewayEmbedder: Embedder = async (text) => {
  const { embedding } = await embed({
    model: "openai/text-embedding-3-small",
    value: text,
  });
  return embedding;
};

export interface PersonaConfig {
  // Days for a memory's relevance to halve. Larger = memories last longer.
  halfLifeDays: number;
}

export interface MemoryEntry {
  id: number;
  message: string;
  summary: string;
  embedding: number[];
  createdAt: number; // epoch ms
}

export interface RetrievedMemory extends MemoryEntry {
  score: number; // cosine similarity x decay, higher is more relevant
}

export class MemoryStore {
  private stores = new Map<string, MemoryEntry[]>();
  private summaries = new Map<string, string>();
  private configs = new Map<string, PersonaConfig>();
  private nextId = 1;

  constructor(private embedder: Embedder = gatewayEmbedder) {}

  configure(persona: string, config: PersonaConfig) {
    this.configs.set(persona, config);
  }

  // Store a message with its embedding. Each persona has its own list, so
  // memories never leak between personas.
  async registerMemory(persona: string, message: string, summary = "", now = Date.now()) {
    const embedding = await this.embedder(message);
    const entry: MemoryEntry = { id: this.nextId++, message, summary, embedding, createdAt: now };
    const list = this.stores.get(persona) ?? [];
    list.push(entry);
    this.stores.set(persona, list);
    if (summary) this.summaries.set(persona, summary);
    return entry;
  }

  // The running conversation summary for a persona, refreshed by callers.
  getSummary(persona: string) {
    return this.summaries.get(persona) ?? "";
  }

  setSummary(persona: string, summary: string) {
    this.summaries.set(persona, summary);
  }

  // Top-N memories for a query, ranked by similarity weighted by age.
  async retrieveMemories(persona: string, query: string, limit = 5, now = Date.now()): Promise<RetrievedMemory[]> {
    const entries = this.stores.get(persona) ?? [];
    if (entries.length === 0) return [];
    const q = await this.embedder(query);
    const halfLife = this.configs.get(persona)?.halfLifeDays ?? 30;
    return entries
      .map((e) => {
        const ageDays = (now - e.createdAt) / 86_400_000;
        const decay = Math.pow(0.5, ageDays / halfLife);
        return { ...e, score: cosine(q, e.embedding) * decay };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

export function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}
