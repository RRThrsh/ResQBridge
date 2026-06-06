import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function TooManyRequest() {
  const [countdown, setCountdown] = useState(60)

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [countdown])

  return (
    <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center">
      <div className="mx-auto max-w-md px-4 sm:px-6 w-full text-center">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8">
          <Clock className="w-10 h-10 text-primary opacity-50" />
        </div>

        <h1 className="text-8xl font-black text-foreground mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          429
        </h1>
        <h2 className="text-xl font-semibold text-foreground mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          Too Many Requests
        </h2>

        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          You have sent too many requests in a short period. Please wait before trying again.
        </p>

        {countdown > 0 && (
          <div className="mb-8">
            <p className="text-xs text-muted-foreground mb-2">Retry in</p>
            <p className="text-4xl font-bold text-foreground tabular-nums" style={{ fontFamily: 'var(--font-heading)' }}>
              {countdown}s
            </p>
            <div className="mt-3 mx-auto w-48 h-1.5 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-1000 linear"
                style={{ width: `${(countdown / 60) * 100}%` }}
              />
            </div>
          </div>
        )}

        {countdown <= 0 && (
          <p className="text-sm text-primary font-medium mb-8">You can now try again.</p>
        )}

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
