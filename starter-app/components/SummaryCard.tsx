import type { LucideIcon } from "lucide-react"
import { CheckCircle, List, MessageSquare } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Built to the lesson 10 (UI with v0) prompt: shadcn Card, large bold headline,
// smaller context text, and a lucide icon per section.
interface SummaryCardProps {
  headline: string
  context: string
  discussionPoints: string
  takeaways: string
}

// The model returns plain strings. Split on line breaks or bullet markers so
// "formatted as a list" works whether it sent bullets or one paragraph.
function toItems(text: string): string[] {
  const inlineBullets = /^\s*[-•*]\s+/.test(text)
  const lines = text.includes("\n")
    ? text.split(/\n+/)
    : inlineBullets
      ? text.split(/\s+[-•*]\s+/)
      : [text]
  const items = lines
    .map((item) => item.replace(/^\s*[-•*]\s+/, "").trim())
    .filter(Boolean)
  return items.length > 0 ? items : [text]
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-2">
      <h3 className="flex items-center gap-2 text-sm font-medium">
        <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
        {title}
      </h3>
      {children}
    </section>
  )
}

export function SummaryCard({ headline, context, discussionPoints, takeaways }: SummaryCardProps) {
  return (
    <Card className="mb-6 w-full border shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold leading-tight text-balance">{headline}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <Section icon={MessageSquare} title="Context">
          <p className="text-sm text-muted-foreground">{context}</p>
        </Section>
        <Section icon={List} title="Discussion points">
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {toItems(discussionPoints).map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </Section>
        <Section icon={CheckCircle} title="Takeaways">
          <ul className="space-y-1 text-sm">
            {toItems(takeaways).map((item, i) => (
              <li key={i} className="flex gap-2">
                <CheckCircle className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>
      </CardContent>
    </Card>
  )
}
