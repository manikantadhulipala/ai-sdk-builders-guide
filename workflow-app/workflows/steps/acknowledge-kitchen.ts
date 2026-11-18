import { updateStatus } from "@/lib/orders-store";
import type { Order } from "@/lib/pizza";

export async function acknowledgeKitchen(order: Order): Promise<void> {
  "use step";

  // Fake latency so the run timeline has something to show.
  await new Promise((resolve) => setTimeout(resolve, 200));

  await updateStatus(order.id, "in-the-kitchen");
}
