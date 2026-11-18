import { updateStatus } from "@/lib/orders-store";
import type { Order } from "@/lib/pizza";
import { log } from "@/lib/log";

export async function confirmDelivery(order: Order): Promise<void> {
  "use step";

  await updateStatus(order.id, "delivered");
  log("info", "delivery.confirmed", { correlationId: order.id });
}
