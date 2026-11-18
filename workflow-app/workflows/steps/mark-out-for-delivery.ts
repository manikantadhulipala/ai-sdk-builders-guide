import { updateStatus } from "@/lib/orders-store";
import type { Order } from "@/lib/pizza";
import { log } from "@/lib/log";

export async function markOutForDelivery(order: Order): Promise<void> {
  "use step";

  await updateStatus(order.id, "out-for-delivery");
  log("info", "delivery.out_for_delivery", { correlationId: order.id });
}
