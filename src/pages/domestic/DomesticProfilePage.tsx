import { UserCircle, Mail, ShieldCheck } from 'lucide-react'
import { DomesticLayout } from '@/components/domestic/DomesticLayout'
import { useDomesticAuth } from '@/context/DomesticAuthContext'

export function DomesticProfilePage() {
  const { domesticApprover } = useDomesticAuth()

  if (!domesticApprover) {
    return null
  }

  return (
    <DomesticLayout
      title="My Profile"
      subtitle="Domestic approver account information"
      backTo="/pwrcc/domestic"
      backLabel="Back"
    >
      <div className="space-y-6">

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-col items-center text-center">

            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
              <UserCircle className="h-10 w-10 text-primary" />
            </div>

            <h2
              className="mt-4 text-2xl font-bold text-foreground"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {domesticApprover.firstName} {domesticApprover.lastName}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Domestic Approver
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Email Address
              </p>

              <p className="text-sm font-medium text-foreground">
                {domesticApprover.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Role
              </p>

              <p className="text-sm font-medium text-foreground">
                Domestic Report Approver
              </p>
            </div>
          </div>

        </div>

      </div>
    </DomesticLayout>
  )
}