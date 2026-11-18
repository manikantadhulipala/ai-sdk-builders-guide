import { updateStatus } from "@/lib/orders-store";
import type { Order } from "@/lib/pizza";
import { log } from "@/lib/log";

export async function dispatchDelivery(order: Order): Promise<void> {
  "use step";

  await updateStatus(order.id, "out-for-delivery");
  log("info", "delivery.dispatched", { correlationId: order.id });
}
