import { useSyncExternalStore } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/LanguageContext'

type Theme = 'light' | 'dark' | 'system'

export function ThemeSetting() {
  const { t } = useLanguage()
  const { theme, setTheme } = useTheme()

  const options: { value: Theme; label: string; description: string; icon: typeof Sun }[] = [
    { value: 'light', label: t('theme.light'), description: t('theme.lightDesc'), icon: Sun },
    { value: 'dark', label: t('theme.dark'), description: t('theme.darkDesc'), icon: Moon },
    { value: 'system', label: t('theme.system'), description: t('theme.systemDesc'), icon: Monitor },
  ]
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  const active = (theme ?? 'system') as Theme

  if (!mounted) {
    return (
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map(({ value }) => (
          <div
            key={value}
            className="h-[4.5rem] animate-pulse rounded-xl border border-border bg-muted/40"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label={t('theme.colorTheme')}>
      {options.map(({ value, label, description, icon: Icon }) => {
        const selected = active === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setTheme(value)}
            className={cn(
              'flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-colors',
              selected
                ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                : 'border-border bg-card hover:border-primary/40 hover:bg-accent/50',
            )}
          >
            <Icon className={cn('h-4 w-4', selected ? 'text-primary' : 'text-muted-foreground')} />
            <span className="text-sm font-medium text-foreground">{label}</span>
            <span className="text-xs text-muted-foreground">{description}</span>
          </button>
        )
      })}
    </div>
  )
}
