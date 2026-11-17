import { NextResponse } from "next/server";
import { recordOrder } from "@/lib/orders-store";
import { MENU, type Order, type PizzaName, type Size, type Crust } from "@/lib/pizza";

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
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "email must be a valid address." };
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
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const result = validate(json);
  if (!result.ok) {
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

  // TODO (Lesson 1.3): Replace this stub with start(processOrder, [order]).
  // For now we generate a fake runId so the redirect to /orders/[runId] works.
  const fakeRunId = crypto.randomUUID();
  recordOrder(order, fakeRunId);

  return NextResponse.json({ runId: fakeRunId });
}
