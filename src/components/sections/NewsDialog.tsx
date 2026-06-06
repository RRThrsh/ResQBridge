import { Calendar } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { type NewsEvent } from '@/data/events'
import { formatDateWithWeekday } from '@/lib/dates'

interface NewsDialogProps {
  item: NewsEvent | null
  onClose: () => void
}

export function NewsDialog({ item, onClose }: NewsDialogProps) {
  if (!item) return null

  const isEvent = item.type === 'event'
  const formattedDate = formatDateWithWeekday(item.date)

  return (
    <Dialog open={!!item} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 bg-background border-border">
        
        <div className="relative h-64 sm:h-80 w-full overflow-hidden">
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          
          <div className="absolute top-4 left-4">
            <Badge className={isEvent ? 'bg-amber-500 text-black border-0' : 'bg-primary text-primary-foreground border-0'}>
              {item.category}
            </Badge>
          </div>
        </div>

        <DialogHeader className="px-6 pt-2 pb-6 text-left">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>
          
          <DialogTitle className="text-2xl sm:text-3xl font-bold text-foreground leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            {item.title}
          </DialogTitle>
          
          <DialogDescription className="text-base text-foreground mt-4 leading-relaxed font-medium">
            {item.excerpt}
          </DialogDescription>
          
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {item.body}
            </p>
          </div>
        </DialogHeader>

      </DialogContent>
    </Dialog>
  )
}
