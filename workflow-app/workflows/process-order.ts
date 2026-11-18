import { createHook, sleep } from "workflow";
import type { Order } from "@/lib/pizza";
import { hookTokens } from "@/lib/hook-tokens";
import { sendOrderConfirmation } from "./steps/send-order-confirmation";
import { acknowledgeKitchen } from "./steps/acknowledge-kitchen";
import { dispatchDelivery } from "./steps/dispatch-delivery";
import { markOutForDelivery } from "./steps/mark-out-for-delivery";
import { confirmDelivery } from "./steps/confirm-delivery";
import { sendReviewRequest } from "./steps/send-review-request";

export async function processOrder(order: Order): Promise<void> {
  "use workflow";

  await sendOrderConfirmation(order);

  // Create each hook before the status that shows its button, so a click
  // can never arrive before the workflow is listening for it.
  const kitchenReady = createHook({ token: hookTokens.kitchenReady(order.id) });
  await acknowledgeKitchen(order);
  await sleep("30s"); // cook time
  await kitchenReady;

  const driverPickup = createHook({ token: hookTokens.driverPickup(order.id) });
  await dispatchDelivery(order); // status: ready-for-pickup
  await driverPickup;

  const delivered = createHook({ token: hookTokens.delivered(order.id) });
  await markOutForDelivery(order); // status: out-for-delivery
  await delivered;

  await confirmDelivery(order);
  await sendReviewRequest(order);
}
