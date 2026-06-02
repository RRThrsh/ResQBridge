import { useState } from 'react'
import { Calendar, Newspaper, ArrowRight } from 'lucide-react'
import { type NewsEvent } from '@/data/events'
import { formatDateWithWeekday } from '@/lib/dates'
import { useNewsContent } from '@/hooks/useSiteContent'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NewsDialog } from './NewsDialog'
import { Card, CardContent } from '@/components/ui/card'

export function EventsSection() {
  const newsEvents = useNewsContent()
  const events = newsEvents.filter(e => e.type === 'event')
  const news = newsEvents.filter(e => e.type === 'news')
  const [selectedNews, setSelectedNews] = useState<NewsEvent | null>(null)

  return (
    <section id="events" className="py-24 bg-card border-y border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-2">
            Stay Informed
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-foreground"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            News & Events
          </h2>
          <p className="text-muted-foreground mt-2 text-sm max-w-md mx-auto">
            Upcoming conservation events and the latest news from PWRCC and Palawan wildlife.
          </p>
        </div>

        <Tabs defaultValue="events" className="w-full">
          <TabsList className="mx-auto flex justify-center w-fit bg-background border border-border rounded-xl mb-8 p-1">
            <TabsTrigger
              value="events"
              className="aria-selected:bg-primary aria-selected:text-primary-foreground text-muted-foreground rounded-lg px-6 py-2 text-xs font-medium transition-all"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Upcoming Events
            </TabsTrigger>
            <TabsTrigger
              value="news"
              className="aria-selected:bg-primary aria-selected:text-primary-foreground text-muted-foreground rounded-lg px-6 py-2 text-xs font-medium transition-all"
            >
              <Newspaper className="w-4 h-4 mr-2" />
              Latest News
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="mt-0 focus-visible:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {events.map((event, i) => (
                <EventCard key={event.id} item={event} index={i} onClick={setSelectedNews} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="news" className="mt-0 focus-visible:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {news.map((item, i) => (
                <EventCard key={item.id} item={item} index={i} onClick={setSelectedNews} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <NewsDialog item={selectedNews} onClose={() => setSelectedNews(null)} />
    </section>
  )
}

function EventCard({ item, index, onClick }: { item: NewsEvent; index: number; onClick: (item: NewsEvent) => void }) {
  const isEvent = item.type === 'event'
  const formattedDate = formatDateWithWeekday(item.date, 'short')

  return (
    <Card
      onClick={() => onClick(item)}
      className="card-shimmer overflow-hidden border-border bg-background hover:border-primary/30 transition-colors duration-300 cursor-pointer animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative h-44 overflow-hidden bg-muted">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute top-3 left-3">
          <Badge className={isEvent ? 'bg-amber-500 text-black border-0' : 'bg-primary text-primary-foreground border-0'}>
            {item.category}
          </Badge>
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white/90 text-xs">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span>{formattedDate}</span>
        </div>
      </div>

      <CardContent className="p-4">
        <h3
          className="text-foreground font-bold text-sm leading-snug mb-2 hover:text-primary transition-colors line-clamp-2"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {item.title}
        </h3>
        <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">
          {item.excerpt}
        </p>
        <div className="mt-4 flex items-center text-primary text-[11px] font-medium gap-1 group/link">
          <span>Read more</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
        </div>
      </CardContent>
    </Card>
  )
}
