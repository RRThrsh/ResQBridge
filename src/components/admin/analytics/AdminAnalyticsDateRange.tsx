import {
  ANALYTICS_DAY_OPTIONS,
  type AnalyticsDays,
  formatAnalyticsDayLabel,
} from '@/lib/reportAnalytics'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Props = {
  days: AnalyticsDays
  onDaysChange: (days: AnalyticsDays) => void
}

function daysToValue(days: AnalyticsDays): string {
  return days === null ? 'all' : String(days)
}

function valueToDays(value: string | null): AnalyticsDays {
  if (value === 'all' || value == null) return null
  const n = Number(value)
  if (n === 7 || n === 30 || n === 90) return n
  return 30
}

export function AdminAnalyticsDateRange({ days, onDaysChange }: Props) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
      <span className="text-sm font-medium text-foreground">Report period</span>
      <Select
        value={daysToValue(days)}
        onValueChange={(val) => onDaysChange(valueToDays(val))}
      >
        <SelectTrigger className="w-full sm:w-[180px]" size="sm" aria-label="Analytics date range">
          <SelectValue>{formatAnalyticsDayLabel(days)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {ANALYTICS_DAY_OPTIONS.map((option) => (
            <SelectItem key={daysToValue(option.value)} value={daysToValue(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
