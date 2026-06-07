import { type LucideIcon } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { cn } from '@/lib/utils'

interface ReportTypeCardProps {
  icon?: LucideIcon
  emoji: string
  title: string
  description: string
  color: string
  isSelected: boolean
  onClick: () => void
}

export function ReportTypeCard({
  emoji,
  title,
  description,
  color,
  isSelected,
  onClick,
}: ReportTypeCardProps) {
  const { t } = useLanguage()
  return (
    <button
      onClick={onClick}
      className={cn(
        'glass-card rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border-2 w-full group',
        isSelected
          ? 'border-primary/70 bg-primary/10 shadow-lg shadow-primary/15'
          : 'border-border hover:border-primary/40 hover:bg-primary/5'
      )}
      aria-pressed={isSelected}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110',
            isSelected ? color.replace('text-', 'bg-').replace('400', '500/20') + ' border border-current/30' : 'bg-primary/10 border border-border'
          )}
          style={isSelected ? { borderColor: 'currentColor', opacity: 1 } : {}}
        >
          <span className="text-2xl">{emoji}</span>
        </div>
        <div>
          <h3
            className={cn(
              'font-bold text-base mb-1 transition-colors',
              isSelected ? 'text-primary' : 'text-foreground group-hover:text-primary'
            )}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        </div>
      </div>

      {isSelected && (
        <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-primary text-xs font-medium">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          {t('reportTypeCard.selected')}
        </div>
      )}
    </button>
  )
}
