import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

type Props = {
  title: string
  icon: LucideIcon
  children: ReactNode
}

export function RescuerDetailSection({ title, icon: Icon, children }: Props) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {title}
      </h2>
      <div className="rounded-2xl border border-border bg-card/80 p-4 text-sm">{children}</div>
    </section>
  )
}
