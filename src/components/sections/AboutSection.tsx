import { Shield, Globe, HeartHandshake, Gift } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'

export function AboutSection() {
  const features = [
    {
      icon: Shield,
      title: 'Wildlife Protection',
      description: 'Coordinating rescue and response for endangered and protected wildlife species across Palawan.',
    },
    {
      icon: Globe,
      title: 'Community Reporting',
      description: 'Empowering every Palawan resident to contribute to wildlife conservation through easy digital reporting.',
    },
    {
      icon: HeartHandshake,
      title: 'Rescue & Rehabilitation',
      description: 'Connecting the public with authorized wildlife responders for safe, humane animal rescue.',
    },
  ]

  return (
    <section id="about" className="py-24 relative overflow-hidden bg-background">
      {/* Background decorations - very subtle */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/3 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left content */}
          <div>
            <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-3">
              About the System
            </p>
            <h2
              className="text-4xl sm:text-5xl font-bold text-foreground leading-tight mb-6"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Every Rescue
              <br />
              <span className="text-gradient">Matters</span>
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              <strong className="text-foreground">DWARRMS</strong> — Domestic Wildlife Animal Report & Rescue 
              Management System — is a centralized reporting platform that helps communities and 
              authorities manage wildlife and domestic animal concerns, rescue incidents, monitoring, 
              and conservation efforts across Palawan.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
              The system bridges the gap between concerned citizens and the Palawan Wildlife Rescue 
              and Conservation Center (PWRCC), ensuring every animal welfare concern is promptly 
              addressed by trained wildlife professionals.
            </p>

            {/* Features */}
            <div className="space-y-6">
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

          {/* Right content — Donation card */}
          <div>
            <Card className="rounded-3xl p-8 border-primary/20 bg-card card-shimmer relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3
                    className="text-foreground font-bold text-xl"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    Support the Wildlife
                  </h3>
                  <p className="text-muted-foreground text-xs">Help us care for the animals</p>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 relative z-10">
                <p className="text-amber-500 text-xs leading-relaxed font-medium">
                  <strong>Note:</strong> PWRCC does not accept cash donations. We gladly welcome in-kind donations to help care for our rescued animals.
                </p>
              </div>

              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-widest mb-4 relative z-10">We accept:</p>
              <div className="grid grid-cols-2 gap-3 relative z-10">
                {[
                  { emoji: '🍎', label: 'Fresh Fruits' },
                  { emoji: '🥬', label: 'Vegetables' },
                  { emoji: '💊', label: 'Vet Supplies' },
                  { emoji: '🐾', label: 'Necessities' },
                  { emoji: '🧴', label: 'Cleaning' },
                  { emoji: '📦', label: 'Containers' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-background border border-border"
                  >
                    <span className="text-lg">{item.emoji}</span>
                    <span className="text-foreground text-xs font-medium">{item.label}</span>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <p className="text-muted-foreground text-xs text-center leading-relaxed relative z-10">
                Bring donations directly to PWRCC Irawan, Puerto Princesa City<br />
                Monday – Sunday, 8:00 AM – 5:00 PM
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
