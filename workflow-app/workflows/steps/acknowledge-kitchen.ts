import { updateStatus } from "@/lib/orders-store";
import type { Order } from "@/lib/pizza";
import { log } from "@/lib/log";

export async function acknowledgeKitchen(order: Order): Promise<void> {
  "use step";

  // Deliberately flaky (about 30% of attempts) to demonstrate automatic retries.
  if (Math.random() < 0.3) {
    log("warn", "kitchen.flaky_failure", { correlationId: order.id });
    throw new Error("Kitchen printer jammed. Retrying.");
  }

  // Fake latency so the run timeline has something to show.
  await new Promise((resolve) => setTimeout(resolve, 200));

  await updateStatus(order.id, "in-the-kitchen");
  log("info", "kitchen.acknowledged", { correlationId: order.id });
}

acknowledgeKitchen.maxRetries = 5;
