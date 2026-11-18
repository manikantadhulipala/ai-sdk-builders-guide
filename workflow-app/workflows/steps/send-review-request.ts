import { FatalError } from "workflow";
import { resend, FROM } from "@/lib/resend";
import { updateStatus } from "@/lib/orders-store";
import type { Order } from "@/lib/pizza";
import { log } from "@/lib/log";

export async function sendReviewRequest(order: Order): Promise<void> {
  "use step";

  const resp = await resend.emails.send({
    from: FROM,
    to: [order.email],
    subject: `How was your ${order.pizza}?`,
    html: `
      <p>Hi ${order.customerName},</p>
      <p>Your pizza has landed. Hit reply and tell us how it was.</p>
      <p>Sal</p>
    `,
  });

  if (resp.error) {
    log("error", "review.failed", { correlationId: order.id, error: resp.error.message });
    throw new FatalError(`Resend failed: ${resp.error.message}`);
  }

  await updateStatus(order.id, "review-sent");
  log("info", "review.sent", { correlationId: order.id });
}
