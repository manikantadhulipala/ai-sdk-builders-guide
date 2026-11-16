import path from "path";
import { MemoryStore, gatewayEmbedder, hashEmbedder, type Embedder } from "./memory-service";

// One shared store per server process, saved to a git-ignored file.
// MEMORY_EMBEDDER=local uses the offline embedder; otherwise the AI Gateway is used.
const FILE = path.join(process.cwd(), ".data", "memory.json");

let store: MemoryStore | null = null;

export function getMemoryStore(): MemoryStore {
  if (!store) {
    const embedder: Embedder = process.env.MEMORY_EMBEDDER === "local" ? hashEmbedder : gatewayEmbedder;
    store = new MemoryStore(embedder);
    store.load(FILE);
    store.configure("default", { halfLifeDays: 30 });
  }
  return store;
}

export function saveMemoryStore() {
  store?.save(FILE);
}
