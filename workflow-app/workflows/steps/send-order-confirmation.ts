import { FatalError } from "workflow";
import { resend, FROM } from "@/lib/resend";
import { updateStatus } from "@/lib/orders-store";
import type { Order } from "@/lib/pizza";
import { log } from "@/lib/log";

export async function sendOrderConfirmation(order: Order): Promise<void> {
  "use step";

  const resp = await resend.emails.send({
    from: FROM,
    to: [order.email],
    subject: `Order confirmed (v2): ${order.size} ${order.pizza}`,
    html: `
      <p>Hi ${order.customerName},</p>
      <p>We got your order for a ${order.size} ${order.pizza} on ${order.crust} crust.</p>
      <p>We'll let you know when it's out for delivery to ${order.address}.</p>
      <p>Sal</p>
    `,
  });

  if (resp.error) {
    // Mark the order so the status page shows the failure instead of "placed" forever.
    log("error", "email.failed", { correlationId: order.id, error: resp.error.message });
    await updateStatus(order.id, "failed");
    throw new FatalError(`Resend failed: ${resp.error.message}`);
  }

  log("info", "email.sent", { correlationId: order.id });
  await updateStatus(order.id, "confirmed");
}
