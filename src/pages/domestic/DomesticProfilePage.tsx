import { Mail, Pencil, Shield, User, UserCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeSetting } from '@/components/theme/ThemeSetting'
import { DomesticLayout } from '@/components/domestic/DomesticLayout'
import { useDomesticAuth } from '@/context/DomesticAuthContext'
import { Button } from '@/components/ui/button'
export function DomesticProfilePage() {
  const { domesticApprover } = useDomesticAuth()

  if (!domesticApprover) {
    return null
  }

  const initials = `${domesticApprover.firstName?.[0] ?? ''}${
    domesticApprover.lastName?.[0] ?? ''
  }`.toUpperCase()

  return (
    <DomesticLayout
      title="My Profile"
      subtitle="Domestic approver account information"
      backTo="/pwrcc/domestic"
      backLabel="Back"
    >
      <div className="space-y-6">

        <Card className="border-border overflow-hidden">
          <CardContent className="flex items-center gap-4 p-6">

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-lg font-bold text-primary">
              {initials || <UserCircle className="h-7 w-7" />}
            </div>

            <div className="min-w-0">
              <p
                className="font-semibold text-foreground"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {domesticApprover.firstName} {domesticApprover.lastName}
              </p>

              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {domesticApprover.email}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Domestic report approver
              </p>
            </div>

          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle
              className="text-base"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Appearance
            </CardTitle>

            <CardDescription>
              How the domestic dashboard looks on this device
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ThemeSetting />
          </CardContent>
        </Card>

        <Card className="border-border">
<CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
  <div className="space-y-1.5">
    <CardTitle
      className="text-base"
      style={{ fontFamily: 'var(--font-heading)' }}
    >
      Profile Details
    </CardTitle>

    <CardDescription>
      Your domestic approver account information
    </CardDescription>
  </div>

  <Button
    type="button"
    variant="ghost"
    size="icon"
    aria-label="Edit profile"
  >
    <Pencil className="h-4 w-4" />
  </Button>
</CardHeader>

          <CardContent>
            <dl className="grid gap-4 text-sm">

              <div className="flex items-start gap-3">
                <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                <div>
                  <dt className="text-xs text-muted-foreground">
                    Full name
                  </dt>

                  <dd className="font-medium">
                    {domesticApprover.firstName} {domesticApprover.lastName}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                <div>
                  <dt className="text-xs text-muted-foreground">
                    Email
                  </dt>

                  <dd>{domesticApprover.email}</dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                <div>
                  <dt className="text-xs text-muted-foreground">
                    Role
                  </dt>

                  <dd className="font-medium">
                    Domestic Report Approver
                  </dd>
                </div>
              </div>

            </dl>
          </CardContent>
        </Card>

      </div>
    </DomesticLayout>
  )
}