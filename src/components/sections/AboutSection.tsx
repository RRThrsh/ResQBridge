import { Shield, Globe, HeartHandshake } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'


export function AboutSection() {
  const { t } = useLanguage()
const features = [
  {
    icon: Shield,
    title: t('about.feature1Title'),
    description: t('about.feature1Desc'),
  },
  {
    icon: Globe,
    title: t('about.feature2Title'),
    description: t('about.feature2Desc'),
  },
  {
    icon: HeartHandshake,
    title: t('about.feature3Title'),
    description: t('about.feature3Desc'),
  },
]

  return (
    <section id="about" className="py-24 relative overflow-hidden bg-background">
      {/* Background decorations - very subtle */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/3 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex justify-center">
          
          {/* Left content */}
          <div className="max-w-3xl text-center">
            <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-3">
              {t('about.eyebrow')}
            </p>
            <h2
              className="text-4xl sm:text-5xl font-bold text-foreground leading-tight mb-6"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {t('about.title1')}
              <br />
              <span className="text-gradient">{t('about.title2')}</span>
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
  {t('about.desc1')}
</p>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
              {t('about.desc2')}
            </p>

            {/* Features */}
            <div className="space-y-6 text-left">
              {features.map((feat) => (
                <div key={feat.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <feat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold text-sm mb-1">{feat.title}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feat.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
