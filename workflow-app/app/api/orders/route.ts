import { NextResponse } from "next/server";
import { start } from "workflow/api";
import { attachRunId, recordOrder, updateStatus } from "@/lib/orders-store";
import { MENU, type Order, type PizzaName, type Size, type Crust } from "@/lib/pizza";
import { processOrder } from "@/workflows/process-order";
import { log } from "@/lib/log";

type IncomingOrder = {
  customerName: string;
  email: string;
  pizza: PizzaName;
  size: Size;
  crust: Crust;
  address: string;
  cardLast4: string;
};

const SIZES: readonly Size[] = ["small", "medium", "large"];
const CRUSTS: readonly Crust[] = ["thin", "thick"];

function validate(body: unknown): { ok: true; order: IncomingOrder } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Request body must be a JSON object." };
  }
  const b = body as Record<string, unknown>;
  const text = (key: keyof IncomingOrder) => (typeof b[key] === "string" ? (b[key] as string).trim() : "");

  const customerName = text("customerName");
  const email = text("email");
  const address = text("address");
  const cardLast4 = text("cardLast4");
  const pizza = text("pizza");
  const size = text("size");
  const crust = text("crust");

  if (!customerName) return { ok: false, error: "customerName is required." };
  // Only reject empty or spaced values here. Resend decides whether the address is deliverable,
  // and a rejected address becomes a failed workflow run that the status page shows.
  if (!email || /\s/.test(email)) return { ok: false, error: "email is required and cannot contain spaces." };
  if (!address) return { ok: false, error: "address is required." };
  if (!/^\d{4}$/.test(cardLast4)) return { ok: false, error: "cardLast4 must be 4 digits." };
  if (!MENU.some((item) => item.name === pizza)) return { ok: false, error: "pizza is not on the menu." };
  if (!SIZES.includes(size as Size)) return { ok: false, error: "size must be small, medium or large." };
  if (!CRUSTS.includes(crust as Crust)) return { ok: false, error: "crust must be thin or thick." };

  return {
    ok: true,
    order: {
      customerName,
      email,
      pizza: pizza as PizzaName,
      size: size as Size,
      crust: crust as Crust,
      address,
      cardLast4,
    },
  };
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    log("warn", "order.rejected", { correlationId: requestId, reason: "invalid_json" });
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const result = validate(json);
  if (!result.ok) {
    log("warn", "order.rejected", { correlationId: requestId, reason: result.error });
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  const body = result.order;

  const order: Order = {
    id: crypto.randomUUID(),
    customerName: body.customerName,
    email: body.email,
    pizza: body.pizza,
    size: body.size,
    crust: body.crust,
    address: body.address,
    cardLast4: body.cardLast4,
    placedAt: new Date().toISOString(),
  };

  await recordOrder(order);
  log("info", "order.received", { correlationId: order.id, pizza: order.pizza, size: order.size, crust: order.crust });

  try {
    const run = await start(processOrder, [order]);
    await attachRunId(order.id, run.runId);
    log("info", "order.started", {
      correlationId: order.id,
      runId: run.runId,
      pizza: order.pizza,
      size: order.size,
      crust: order.crust,
      durationMs: Date.now() - startedAt,
    });
    return NextResponse.json({ runId: run.runId });
  } catch (error) {
    log("error", "order.start_failed", {
      correlationId: order.id,
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - startedAt,
    });
    await updateStatus(order.id, "failed");
    return NextResponse.json({ error: "Could not place the order. Please try again." }, { status: 500 });
  }
}
