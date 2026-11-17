import { resumeOrderHook } from "@/lib/resume-order";
import { hookTokens } from "@/lib/hook-tokens";

export async function POST(request: Request) {
  return resumeOrderHook(request, "out-for-delivery", hookTokens.delivered);
}
