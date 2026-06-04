import { useMemo, useState } from 'react'
import { useQuery } from 'convex/react'
import { CheckCircle2, Clock, Loader2, Sparkles } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import { useDomesticAuth } from '@/context/DomesticAuthContext'
import { DomesticReportCard } from '@/components/domestic/DomesticReportCard' 
import { rescuerReportToStored } from '@/lib/reports'
import { cn } from '@/lib/utils'

type Tab = 'pending' | 'published'

function StatCard({
  label,
  value,
  icon: Icon,
  active,
  onClick,
}: {
  label: string
  value: number
  icon: typeof Clock
  active?: boolean
  onClick?: () => void
}) {
  const Comp = onClick ? 'button' : 'div'

  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'flex flex-1 flex-col items-start rounded-2xl border p-4 text-left transition-all',
        active
          ? 'border-primary/40 bg-primary/5 shadow-sm'
          : 'border-border bg-card/60 hover:border-border/80',
      )}
    >
      <div
        className={cn(
          'mb-3 flex h-9 w-9 items-center justify-center rounded-lg',
          active ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground',
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
        {value}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </Comp>
  )
}

function EmptyState({ tab }: { tab: Tab }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
        {tab === 'pending' ? (
          <Clock className="h-6 w-6 text-primary" />
        ) : (
          <CheckCircle2 className="h-6 w-6 text-primary" />
        )}
      </div>
      <h3
        className="text-lg font-semibold text-foreground"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {tab === 'pending' ? 'No pending reports' : 'No published reports'}
      </h3>
      <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
        {tab === 'pending'
          ? 'When a user submits a domestic report, it will appear here for your review.'
          : 'Approved domestic reports will show up here and on the public feed.'}
      </p>
    </div>
  )
}

export function DomesticReportsPage() {
  const { domesticApprover } = useDomesticAuth()
  const [tab, setTab] = useState<Tab>('pending')

  // @ts-ignore
  const pendingRows = useQuery((api as any).domestic.listPendingReports)
  // @ts-ignore
  const publishedRows = useQuery((api as any).domestic.listPublishedReports)

  const pending = useMemo(
    () => (pendingRows ? pendingRows.map(rescuerReportToStored) : []),
    [pendingRows],
  )
  const published = useMemo(
    () => (publishedRows ? publishedRows.map(rescuerReportToStored) : []),
    [publishedRows],
  )

  const loading = pendingRows === undefined || publishedRows === undefined
  const list = tab === 'pending' ? pending : published

  return (
    <>
      <section className="mb-8">
        <div className="mb-1 flex items-center gap-2 text-primary">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-widest">Review Dashboard</span>
        </div>
        <h2
          className="text-2xl font-bold text-foreground sm:text-3xl"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {domesticApprover ? `Hello, ${domesticApprover.firstName}` : 'Domestic Approvals'}
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
          Review user-submitted domestic reports before they are published to the public feed.
        </p>
      </section>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="mb-8 flex gap-3">
            <StatCard
              label="Needs Approval"
              value={pending.length}
              icon={Clock}
              active={tab === 'pending'}
              onClick={() => setTab('pending')}
            />
            <StatCard
              label="Published"
              value={published.length}
              icon={CheckCircle2}
              active={tab === 'published'}
              onClick={() => setTab('published')}
            />
          </div>

          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="inline-flex rounded-xl border border-border bg-muted/40 p-1">
              {(
                [
                  ['pending', 'Needs Review'],
                  ['published', 'Published'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTab(value as Tab)}
                  className={cn(
                    'rounded-lg px-4 py-2 text-xs font-medium transition-all',
                    tab === value
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {label}
                  <span className="ml-1.5 tabular-nums text-muted-foreground">
                    ({value === 'pending' ? pending.length : published.length})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {list.length === 0 ? (
            <EmptyState tab={tab} />
          ) : (
            <div className="space-y-3">
              {list.map((report: any) => (
                <DomesticReportCard key={report.id} report={report} />
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}
