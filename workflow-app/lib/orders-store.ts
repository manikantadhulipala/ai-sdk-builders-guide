import type { Order, OrderStatus } from "./pizza";

type StoredOrder = {
  order: Order;
  runId: string | undefined;
  status: OrderStatus;
  updatedAt: string;
};

// Kept on globalThis so the API route and the order page share one store.
// Next bundles each route separately, so a plain module-level Map is not shared.
const globalForStore = globalThis as typeof globalThis & {
  __pizzaOrderStore?: Map<string, StoredOrder>;
};
const store = (globalForStore.__pizzaOrderStore ??= new Map<string, StoredOrder>());

// Store the order before its workflow starts, so the confirmation step can
// update its status even if it finishes first. The run ID is attached after start().
export function recordOrder(order: Order): void {
  store.set(order.id, {
    order,
    runId: undefined,
    status: "placed",
    updatedAt: new Date().toISOString(),
  });
}

export function attachRunId(orderId: string, runId: string): void {
  const existing = store.get(orderId);
  if (!existing) return;
  store.set(orderId, { ...existing, runId });
}

export function updateStatus(orderId: string, status: OrderStatus): void {
  const existing = store.get(orderId);
  if (!existing) return;
  store.set(orderId, {
    ...existing,
    status,
    updatedAt: new Date().toISOString(),
  });
}

export function getOrderByRunId(runId: string): StoredOrder | undefined {
  for (const entry of store.values()) {
    if (entry.runId === runId) return entry;
  }
  return undefined;
}

// Only orders whose workflow has started, so every listed order has a run ID.
export function listOrdersByStatus(status: OrderStatus): (StoredOrder & { runId: string })[] {
  return Array.from(store.values())
    .filter((entry): entry is StoredOrder & { runId: string } =>
      entry.status === status && entry.runId !== undefined,
    )
    .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
}
