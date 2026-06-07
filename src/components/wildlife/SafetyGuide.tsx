import { EyeOff, PawPrint, Volume2, Camera, Phone, Link } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export function SafetyGuide() {
  const { t } = useLanguage()
  const tips = [
    { Icon: EyeOff, title: t('safetyGuide.tip1Title'), description: t('safetyGuide.tip1Desc') },
    { Icon: PawPrint, title: t('safetyGuide.tip2Title'), description: t('safetyGuide.tip2Desc') },
    { Icon: Volume2, title: t('safetyGuide.tip3Title'), description: t('safetyGuide.tip3Desc') },
    { Icon: Camera, title: t('safetyGuide.tip4Title'), description: t('safetyGuide.tip4Desc') },
    { Icon: Phone, title: t('safetyGuide.tip5Title'), description: t('safetyGuide.tip5Desc') },
    { Icon: Link, title: t('safetyGuide.tip6Title'), description: t('safetyGuide.tip6Desc') },
  ]

  return (
    <div className="glass-card rounded-3xl p-8 border-primary/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
          <span className="text-2xl">⚠️</span>
        </div>
        <div>
          <h3
            className="text-foreground font-bold text-xl"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {t('safetyGuide.title')}
          </h3>
          <p className="text-muted-foreground text-xs">{t('safetyGuide.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tips.map(({ Icon, title, description }) => (
          <div
            key={title}
            className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-border hover:border-primary/30 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0 mt-0.5">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-foreground font-medium text-sm">{title}</p>
              <p className="text-muted-foreground text-xs leading-relaxed mt-0.5">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
