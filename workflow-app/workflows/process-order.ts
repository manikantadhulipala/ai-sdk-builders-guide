import { createHook, sleep } from "workflow";
import type { Order } from "@/lib/pizza";
import { hookTokens } from "@/lib/hook-tokens";
import { sendOrderConfirmation } from "./steps/send-order-confirmation";
import { acknowledgeKitchen } from "./steps/acknowledge-kitchen";
import { dispatchDelivery } from "./steps/dispatch-delivery";
import { markOutForDelivery } from "./steps/mark-out-for-delivery";
import { confirmDelivery } from "./steps/confirm-delivery";
import { sendReviewRequest } from "./steps/send-review-request";
import { sendEscalationEmail } from "./steps/send-escalation-email";

// Test value. Set back to "20m" before merging.
const KITCHEN_TIMEOUT = "30s";

export async function processOrder(order: Order): Promise<{
  status: "delivered" | "escalated";
  orderId: string;
}> {
  "use workflow";

  await sendOrderConfirmation(order);

  // Create the hook before the status that shows its button, so a click can
  // never arrive before the workflow is listening for it.
  const kitchenReady = createHook({ token: hookTokens.kitchenReady(order.id) });
  await acknowledgeKitchen(order);

  // Wait for "Mark ready" or the timeout, whichever comes first.
  const kitchenResult = await Promise.race([
    kitchenReady.then((payload) => ({ kind: "ready" as const, payload })),
    sleep(KITCHEN_TIMEOUT).then(() => ({ kind: "timeout" as const })),
  ]);

  if (kitchenResult.kind === "timeout") {
    await sendEscalationEmail(order);
    return { status: "escalated", orderId: order.id };
  }

  const driverPickup = createHook({ token: hookTokens.driverPickup(order.id) });
  await dispatchDelivery(order); // status: ready-for-pickup
  await driverPickup;

  const delivered = createHook({ token: hookTokens.delivered(order.id) });
  await markOutForDelivery(order); // status: out-for-delivery
  await delivered;

  await confirmDelivery(order);
  await sendReviewRequest(order);

  return { status: "delivered", orderId: order.id };
}
