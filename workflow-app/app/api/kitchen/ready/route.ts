import { resumeOrderHook } from "@/lib/resume-order";
import { hookTokens } from "@/lib/hook-tokens";

export async function POST(request: Request) {
  return resumeOrderHook(request, "in-the-kitchen", hookTokens.kitchenReady);
}
