import { useMemo, useState } from 'react'
import { useQuery } from 'convex/react'
import { CheckCircle2, Clock, Loader2, PawPrint, Sparkles } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import { RescuerReportCard } from '@/components/rescuer/RescuerReportCard'
import { useRescuerAuth } from '@/context/RescuerAuthContext'
import { normalizeEmail } from '@/lib/admin'
import { rescuerReportToStored } from '@/lib/reports'
import { cn } from '@/lib/utils'

type Tab = 'active' | 'rescued'

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
        {tab === 'active' ? (
          <Clock className="h-6 w-6 text-primary" />
        ) : (
          <PawPrint className="h-6 w-6 text-primary" />
        )}
      </div>
      <h3
        className="text-lg font-semibold text-foreground"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {tab === 'active' ? 'No active dispatches' : 'No rescued animals yet'}
      </h3>
      <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
        {tab === 'active'
          ? 'When admin assigns you a report, it will appear here for response.'
          : 'Completed rescues will show here once you mark a dispatch as successful or failed.'}
      </p>
    </div>
  )
}

export function RescuerReportsPage() {
  const { rescuer } = useRescuerAuth()
  const [tab, setTab] = useState<Tab>('active')
  const email = rescuer ? normalizeEmail(rescuer.email) : ''

  const activeRows = useQuery(
    api.rescuers.listAssignedReports,
    rescuer ? { rescuerEmail: email } : 'skip',
  )
  const completedRows = useQuery(
    api.rescuers.listCompletedReports,
    rescuer ? { rescuerEmail: email } : 'skip',
  )

  const active = useMemo(
    () => (activeRows ? activeRows.map(rescuerReportToStored) : []),
    [activeRows],
  )
  const rescued = useMemo(
    () => (completedRows ? completedRows.map(rescuerReportToStored) : []),
    [completedRows],
  )

  const successCount = useMemo(
    () => rescued.filter((r) => r.status === 'rescue_success').length,
    [rescued],
  )

  const loading = activeRows === undefined || completedRows === undefined
  const list = tab === 'active' ? active : rescued

  return (
    <>
      <section className="mb-8">
        <div className="mb-1 flex items-center gap-2 text-primary">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-widest">Field dashboard</span>
        </div>
        <h2
          className="text-2xl font-bold text-foreground sm:text-3xl"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {rescuer ? `Hello, ${rescuer.firstName}` : 'Rescuer dashboard'}
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
          Manage active dispatches and review animals you have already rescued.
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
              label="Active now"
              value={active.length}
              icon={Clock}
              active={tab === 'active'}
              onClick={() => setTab('active')}
            />
            <StatCard
              label="Rescued"
              value={rescued.length}
              icon={CheckCircle2}
              active={tab === 'rescued'}
              onClick={() => setTab('rescued')}
            />
          </div>

          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="inline-flex rounded-xl border border-border bg-muted/40 p-1">
              {(
                [
                  ['active', 'Active'],
                  ['rescued', 'Rescued'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTab(value)}
                  className={cn(
                    'rounded-lg px-4 py-2 text-xs font-medium transition-all',
                    tab === value
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {label}
                  <span className="ml-1.5 tabular-nums text-muted-foreground">
                    ({value === 'active' ? active.length : rescued.length})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {tab === 'rescued' && rescued.length > 0 ? (
            <p className="mb-4 text-xs text-muted-foreground">
              {successCount} successful
              {rescued.length - successCount > 0
                ? ` · ${rescued.length - successCount} unsuccessful`
                : ''}
            </p>
          ) : null}

          {list.length === 0 ? (
            <EmptyState tab={tab} />
          ) : (
            <div className="space-y-3">
              {list.map((report) => (
                <RescuerReportCard key={report.id} report={report} />
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}
