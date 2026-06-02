import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type Props = {
  title: string
  description: string
  empty?: boolean
  emptyMessage?: string
  children: ReactNode
}

export function AdminChartCard({
  title,
  description,
  empty = false,
  emptyMessage = 'No data for this period.',
  children,
}: Props) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {empty ? (
          <p className="flex min-h-[200px] items-center justify-center text-center text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
