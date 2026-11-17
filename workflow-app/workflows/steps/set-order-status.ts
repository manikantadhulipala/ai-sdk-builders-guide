import { updateStatus } from "@/lib/orders-store";
import type { OrderStatus } from "@/lib/pizza";

export async function setOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  "use step";

  await updateStatus(orderId, status);
}
