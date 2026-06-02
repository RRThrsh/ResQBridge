import { EyeOff, PawPrint, Volume2, Camera, Phone, Link } from 'lucide-react'

const tips = [
  { Icon: EyeOff, title: 'Do not approach', description: 'Keep your distance. Wild animals are unpredictable and may feel threatened.' },
  { Icon: PawPrint, title: 'Do not feed', description: 'Human food can be harmful and makes wildlife dependent on people.' },
  { Icon: Volume2, title: 'Stay quiet', description: 'Loud noises stress animals and can cause them to abandon nests or young.' },
  { Icon: Camera, title: 'Take photos', description: 'Document the sighting from a safe distance. Photos help PWRCC identify species.' },
  { Icon: Phone, title: 'Report it', description: 'Submit a wildlife sighting report through DWARRMS or call PWRCC directly.' },
  { Icon: Link, title: 'Keep pets away', description: 'Restrain pets to prevent dangerous encounters with wildlife.' },
]

export function SafetyGuide() {
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
            What To Do
          </h3>
          <p className="text-muted-foreground text-xs">If you encounter wildlife</p>
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
