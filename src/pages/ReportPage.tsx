import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, HelpCircle, Shield, PawPrint, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { WildlifeSightingForm } from '@/components/report/WildlifeSightingForm'
import { DomesticReportForm } from '@/components/report/DomesticReportForm'
import { useUserAuth } from '@/context/UserAuthContext'

type ReportType = 'wildlife' | 'domestic' | null

export function ReportPage({ onLoginRequest }: { onLoginRequest: () => void }) {
  const { isLoggedIn } = useUserAuth()
  const [reportType, setReportType] = useState<ReportType>(null)

  function selectReportType(type: Exclude<ReportType, null>) {
    setReportType(type)
    if (!isLoggedIn) {
      onLoginRequest()
    }
  }

  return (
    <div className="min-h-screen pt-28 pb-20 bg-background">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">

        {/* Breadcrumb & Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">Report</span>
          </div>

          {!reportType && (
            <>
              <p className="text-primary text-xs font-bold tracking-widest uppercase mb-3">
                Emergency & Sighting Reports
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-5" style={{ fontFamily: 'var(--font-heading)' }}>
                What are you reporting?
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed max-w-lg">
                Select the category that best matches your concern. Your report will be directed to the appropriate response team at PWRCC.
              </p>
            </>
          )}

          {reportType && (
            <button
              onClick={() => setReportType(null)}
              className="group flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to categories
            </button>
          )}
        </div>

        {/* Selection Cards */}
        {!reportType && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 animate-fade-up">

            {/* Wildlife Card */}
            <Card
              onClick={() => selectReportType('wildlife')}
              className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer group rounded-3xl overflow-hidden shadow-sm hover:shadow-md"
            >
              <CardContent className="p-10 flex flex-col items-center text-center h-full">
                <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <PawPrint className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                  Wildlife Sighting or Rescue
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                  Endemic species, protected wildlife, marine animals, birds of prey, or reptiles in need of rescue or just spotted.
                </p>
                <div className="mt-auto pt-8 w-full border-t border-border/50">
                  <span className="text-xs font-bold text-primary uppercase tracking-widest flex items-center justify-center gap-2 group-hover:gap-3 transition-all">
                    Select Wildlife <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Domestic Card */}
            <Card
              onClick={() => selectReportType('domestic')}
              className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer group rounded-3xl overflow-hidden shadow-sm hover:shadow-md"
            >
              <CardContent className="p-10 flex flex-col items-center text-center h-full">
                <div className="w-20 h-20 rounded-3xl bg-muted border border-border flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <HelpCircle className="w-10 h-10 text-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                  Domestic Animal
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                  Missing pets, found strays, injured dogs/cats, or animal welfare concerns within the community.
                </p>
                <div className="mt-auto pt-8 w-full border-t border-border/50">
                  <span className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center justify-center gap-2 group-hover:gap-3 transition-all">
                    Select Domestic <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </span>
                </div>
              </CardContent>
            </Card>

          </div>
        )}

        {/* Not Logged In Warning (if they clicked but aren't authed) */}
        {reportType && !isLoggedIn && (
          <div className="bg-card border border-border rounded-3xl p-12 text-center animate-fade-in shadow-sm">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 text-primary">
              <Shield className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
              Verification Required
            </h3>
            <p className="text-base text-muted-foreground mb-10 max-w-sm mx-auto leading-relaxed">
              To prevent spam and ensure we can contact you regarding this report, please verify your email address first.
            </p>
            <Button onClick={onLoginRequest} className="h-14 px-10 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]">
              Verify Email Now
            </Button>
          </div>
        )}

        {/* Render Forms */}
        {reportType === 'wildlife' && isLoggedIn && (
          <div className="animate-fade-in">
            <WildlifeSightingForm />
          </div>
        )}

        {reportType === 'domestic' && isLoggedIn && (
          <div className="animate-fade-in">
            <DomesticReportForm />
          </div>
        )}

      </div>
    </div>
  )
}
