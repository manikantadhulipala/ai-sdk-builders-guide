import { FatalError } from "workflow";
import { updateStatus } from "@/lib/orders-store";
import type { Order } from "@/lib/pizza";
import { log } from "@/lib/log";

export async function chargeCard(order: Order): Promise<{ chargedAt: string }> {
  "use step";

  if (order.cardLast4 === "0000") {
    // Final failure: retrying a declined card will not help, so use FatalError.
    // Mark the order first so the status page shows the failure.
    await updateStatus(order.id, "failed");
    log("error", "payment.declined", { correlationId: order.id });
    throw new FatalError(`Card declined for order ${order.id}`);
  }

  // Fake latency so the run timeline has something to show.
  await new Promise((resolve) => setTimeout(resolve, 200));

  await updateStatus(order.id, "charged");
  log("info", "payment.charged", { correlationId: order.id });
  return { chargedAt: new Date().toISOString() };
}
