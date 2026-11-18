import { FatalError } from "workflow";
import { resend, FROM } from "@/lib/resend";
import { updateStatus } from "@/lib/orders-store";
import type { Order } from "@/lib/pizza";
import { log } from "@/lib/log";

export async function sendEscalationEmail(order: Order): Promise<void> {
  "use step";

  const resp = await resend.emails.send({
    from: FROM,
    to: [order.email],
    subject: "We're checking on your order",
    html: `
      <p>Hi ${order.customerName},</p>
      <p>Your ${order.pizza} is taking longer than usual. We're calling the kitchen now.</p>
      <p>Sal</p>
    `,
  });

  if (resp.error) {
    log("error", "escalation.failed", { correlationId: order.id, error: resp.error.message });
    throw new FatalError(`Resend failed: ${resp.error.message}`);
  }

  await updateStatus(order.id, "escalated");
  log("info", "order.escalated", { correlationId: order.id });
}
