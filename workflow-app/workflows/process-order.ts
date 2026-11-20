import { createHook, sleep } from "workflow";
import type { Order } from "@/lib/pizza";
import { hookTokens } from "@/lib/hook-tokens";
import { chargeCard } from "./steps/charge-card";
import { sendOrderConfirmation } from "./steps/send-order-confirmation";
import { acknowledgeKitchen } from "./steps/acknowledge-kitchen";
import { dispatchDelivery } from "./steps/dispatch-delivery";
import { markOutForDelivery } from "./steps/mark-out-for-delivery";
import { confirmDelivery } from "./steps/confirm-delivery";
import { sendReviewRequest } from "./steps/send-review-request";
import { sendEscalationEmail } from "./steps/send-escalation-email";
import { setOrderStatus } from "./steps/set-order-status";

// Kitchen timeout for the escalation race.
const KITCHEN_TIMEOUT = "20m";

type OrderResult = { status: "delivered" | "escalated"; orderId: string };

export async function processOrder(order: Order): Promise<OrderResult> {
  "use workflow";

  try {
    return await fulfillOrder(order);
  } catch (error) {
    // A step that runs out of retries fails the run without touching the order,
    // which would leave the status page stuck on its last status. Mark it failed,
    // then rethrow so the run still shows as failed in the dashboard.
    await setOrderStatus(order.id, "failed");
    throw error;
  }
}

async function fulfillOrder(order: Order): Promise<OrderResult> {
  await chargeCard(order);
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
