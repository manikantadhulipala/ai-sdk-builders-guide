import { NextResponse } from "next/server";
import { resumeHook } from "workflow/api";
import { getOrderById } from "@/lib/orders-store";
import type { OrderStatus } from "@/lib/pizza";
import { log } from "@/lib/log";

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
    log("warn", "hook.rejected", {
      correlationId: orderId,
      expected: expectedStatus,
      actual: entry.status,
    });
    return NextResponse.json(
      { error: `Order is ${entry.status}, expected ${expectedStatus}.` },
      { status: 409 },
    );
  }

  const startedAt = Date.now();
  try {
    await resumeHook(tokenFor(orderId), { resumedAt: new Date().toISOString() });
    log("info", "hook.resumed", { correlationId: orderId, step: expectedStatus, durationMs: Date.now() - startedAt });
  } catch (error) {
    log("error", "hook.resume_failed", {
      correlationId: orderId,
      step: expectedStatus,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "The workflow is not waiting for this step yet. Try again in a moment." },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true });
}
