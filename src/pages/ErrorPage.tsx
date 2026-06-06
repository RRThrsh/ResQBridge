import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ShieldAlert, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

const errors: Record<string, { title: string; message: string; icon: typeof ShieldAlert }> = {
  '401': {
    title: 'Unauthorized',
    message: 'Your session has expired or you do not have permission to access this page. Please sign in again.',
    icon: ShieldAlert,
  },
  '429': {
    title: 'Too Many Requests',
    message: 'You have sent too many requests in a short period. Please wait a moment before trying again.',
    icon: Clock,
  },
}

export function ErrorPage() {
  const { code = '401' } = useParams<{ code: string }>()
  const info = errors[code] ?? errors['401']
  const Icon = info.icon

  return (
    <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center">
      <div className="mx-auto max-w-md px-4 sm:px-6 w-full text-center">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8">
          <Icon className="w-10 h-10 text-primary opacity-50" />
        </div>

        <h1 className="text-8xl font-black text-foreground mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          {code}
        </h1>
        <h2 className="text-xl font-semibold text-foreground mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          {info.title}
        </h2>

        <p className="text-sm text-muted-foreground leading-relaxed mb-10">
          {info.message}
        </p>

        <Link to="/">
          <Button className="h-11 px-8 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-none">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
