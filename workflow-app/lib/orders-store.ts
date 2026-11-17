import { neon } from "@neondatabase/serverless";
import type { Order, OrderStatus } from "./pizza";

// Orders live in Postgres (Neon, added from the Vercel Marketplace), so every
// Vercel instance and the workflow runtime see the same data.
const sql = neon(process.env.DATABASE_URL ?? "");

export type StoredOrder = {
  order: Order;
  runId: string | undefined;
  status: OrderStatus;
  updatedAt: string;
};

type Row = {
  data: Order;
  run_id: string | null;
  status: OrderStatus;
  updated_at: string;
};

function toStored(row: Row): StoredOrder {
  return {
    order: row.data,
    runId: row.run_id ?? undefined,
    status: row.status,
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

// Create the table on first use, once per process.
let schemaReady: Promise<void> | undefined;
function ensureSchema(): Promise<void> {
  schemaReady ??= (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        run_id TEXT,
        status TEXT NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL,
        data JSONB NOT NULL
      )
    `;
  })();
  return schemaReady;
}

// Store the order before its workflow starts, so the confirmation step can
// update its status even if it finishes first. The run ID is attached after start().
export async function recordOrder(order: Order): Promise<void> {
  await ensureSchema();
  await sql`
    INSERT INTO orders (id, run_id, status, updated_at, data)
    VALUES (${order.id}, NULL, 'placed', now(), ${JSON.stringify(order)}::jsonb)
  `;
}

export async function attachRunId(orderId: string, runId: string): Promise<void> {
  await ensureSchema();
  await sql`UPDATE orders SET run_id = ${runId}, updated_at = now() WHERE id = ${orderId}`;
}

export async function updateStatus(orderId: string, status: OrderStatus): Promise<void> {
  await ensureSchema();
  await sql`UPDATE orders SET status = ${status}, updated_at = now() WHERE id = ${orderId}`;
}

export async function getOrderByRunId(runId: string): Promise<StoredOrder | undefined> {
  await ensureSchema();
  const rows = (await sql`
    SELECT data, run_id, status, updated_at FROM orders WHERE run_id = ${runId} LIMIT 1
  `) as Row[];
  return rows[0] ? toStored(rows[0]) : undefined;
}

// Only orders whose workflow has started, so every listed order has a run ID.
export async function listOrdersByStatus(
  status: OrderStatus,
): Promise<(StoredOrder & { runId: string })[]> {
  await ensureSchema();
  const rows = (await sql`
    SELECT data, run_id, status, updated_at FROM orders
    WHERE status = ${status} AND run_id IS NOT NULL
    ORDER BY updated_at ASC
  `) as Row[];
  return rows.map((row) => ({ ...toStored(row), runId: row.run_id as string }));
}
