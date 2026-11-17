import { updateStatus } from "@/lib/orders-store";
import type { OrderStatus } from "@/lib/pizza";
import { log } from "@/lib/log";

export async function setOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  "use step";

  await updateStatus(orderId, status);
  log("info", "order.status", { correlationId: orderId, status });
}
