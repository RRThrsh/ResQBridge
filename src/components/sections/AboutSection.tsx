import { Shield, Globe, HeartHandshake } from 'lucide-react'


export function AboutSection() {
const features = [
  {
    icon: Shield,
    title: 'Animal Protection',
    description:
      'Coordinating rescue, response, and protection efforts for both domestic and wildlife animals in need across the community.',
  },
  {
    icon: Globe,
    title: 'Community Reporting',
    description:
      'Empowering citizens to report injured, stray, abandoned, abused, and wildlife animals through an accessible digital platform.',
  },
  {
    icon: HeartHandshake,
    title: 'Rescue & Rehabilitation',
    description:
      'Connecting the public with authorized responders and partner organizations to ensure safe rescue, proper care, and rehabilitation of domestic and wildlife animals.',
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
  <strong className="text-foreground">ResQBridge</strong> — A Web-Based Animal Rescue and Reporting System
  that helps communities and authorities manage wildlife and domestic animal concerns,
  rescue incidents, monitoring, and conservation efforts across Palawan.
</p>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
              The system bridges the gap between concerned citizens, animal rescuers,
              and responsible authorities, ensuring every animal welfare concern is
              promptly addressed and monitored through a centralized platform.
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
