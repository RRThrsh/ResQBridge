import { Link } from 'react-router-dom'
import { ArrowLeft, Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/context/LanguageContext'

export function NotFound() {
  const { t } = useLanguage()
  return (
    <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center">
      <div className="mx-auto max-w-md px-4 sm:px-6 w-full text-center">
        
        <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8">
          <Leaf className="w-10 h-10 text-primary opacity-50" />
        </div>

        <h1 className="text-8xl font-black text-foreground mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          404
        </h1>
        <h2 className="text-xl font-semibold text-foreground mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          {t('notFound.title')}
        </h2>
        
        <p className="text-sm text-muted-foreground leading-relaxed mb-10">
          {t('notFound.desc')}
        </p>

        <Link to="/">
          <Button className="h-11 px-8 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-none">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('notFound.returnHome')}
          </Button>
        </Link>
      </div>
    </div>
  )
}
