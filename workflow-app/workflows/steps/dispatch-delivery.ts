import { updateStatus } from "@/lib/orders-store";
import type { Order } from "@/lib/pizza";
import { log } from "@/lib/log";

export async function dispatchDelivery(order: Order): Promise<void> {
  "use step";

  // Fake latency so the run timeline has something to show.
  await new Promise((resolve) => setTimeout(resolve, 200));

  await updateStatus(order.id, "ready-for-pickup");
  log("info", "delivery.ready_for_pickup", { correlationId: order.id });
}
