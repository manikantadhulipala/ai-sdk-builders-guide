import type { LucideIcon } from "lucide-react"
import { CalendarDays, Clock, MapPin } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface EventCardProps {
  title: string
  date: string
  time: string
  location: string
  className?: string
}

function EventDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <dt className="sr-only">{label}</dt>
      <dd className="text-sm text-muted-foreground">{value}</dd>
    </div>
  )
}

export function EventCard({ title, date, time, location, className }: EventCardProps) {
  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader>
        <CardTitle className="text-lg leading-snug text-balance">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="flex flex-col gap-3">
          <EventDetail icon={CalendarDays} label="Date" value={date} />
          <EventDetail icon={Clock} label="Time" value={time} />
          <EventDetail icon={MapPin} label="Location" value={location} />
        </dl>
      </CardContent>
    </Card>
  )
}
