import type { Order } from "@/lib/pizza";
import { sendOrderConfirmation } from "./steps/send-order-confirmation";

export async function processOrder(order: Order): Promise<void> {
  "use workflow";

  await sendOrderConfirmation(order);
}
