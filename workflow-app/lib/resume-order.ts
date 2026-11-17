import { NextResponse } from "next/server";
import { resumeHook } from "workflow/api";
import { getOrderById } from "@/lib/orders-store";
import type { OrderStatus } from "@/lib/pizza";

// Shared handler for the kitchen and driver buttons. It only resumes the
// workflow if the order is in the state that button applies to, so a double
// click or a click on the wrong order cannot skip a step.
//
// Known gap: these routes have no login, so anyone who knows an order ID can
// call them. Add an operator check before using this beyond the course.
export async function resumeOrderHook(
  request: Request,
  expectedStatus: OrderStatus,
  tokenFor: (orderId: string) => string,
): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const orderId = typeof body === "object" && body !== null ? (body as { orderId?: unknown }).orderId : undefined;
  if (typeof orderId !== "string" || orderId.length === 0) {
    return NextResponse.json({ error: "orderId is required." }, { status: 400 });
  }

  const entry = await getOrderById(orderId);
  if (!entry) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  if (entry.status !== expectedStatus) {
    return NextResponse.json(
      { error: `Order is ${entry.status}, expected ${expectedStatus}.` },
      { status: 409 },
    );
  }

  try {
    await resumeHook(tokenFor(orderId), { resumedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Could not resume order hook", error);
    return NextResponse.json(
      { error: "The workflow is not waiting for this step yet. Try again in a moment." },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true });
}
