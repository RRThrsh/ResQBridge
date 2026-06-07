import React, { useState } from 'react'

import {
  Loader2,
  Mail,
  Pencil,
  Shield,
  User,
  UserCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Input } from '@/components/ui/input'

import { ThemeSetting } from '@/components/theme/ThemeSetting'


import { useDomesticAuth } from '@/context/DomesticAuthContext'

export function DomesticProfilePage() {
  const { domesticApprover } = useDomesticAuth()

  const [isEditing, setIsEditing] = useState(false)

  const [firstName, setFirstName] = useState(
    domesticApprover?.firstName ?? '',
  )

  const [lastName, setLastName] = useState(
    domesticApprover?.lastName ?? '',
  )
const [contactPhone, setContactPhone] = useState(
  domesticApprover?.contactPhone ?? '',
)

const [password, setPassword] = useState('')

const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)

  if (!domesticApprover) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

function startEditing() {
  if (!domesticApprover) return

  setFirstName(domesticApprover.firstName)
  setLastName(domesticApprover.lastName)
  setContactPhone(domesticApprover.contactPhone ?? '')
  setPassword('')
  setConfirmPassword('')
  setIsEditing(true)
}

function cancelEditing() {
  if (!domesticApprover) return

  setFirstName(domesticApprover.firstName)
  setLastName(domesticApprover.lastName)
  setContactPhone(domesticApprover.contactPhone ?? '')
  setPassword('')
  setConfirmPassword('')
  setIsEditing(false)
}

async function handleSave(e: React.FormEvent) {
  e.preventDefault()

  const isValidPhone =
  /^09\d{9}$/.test(contactPhone)

if (!isValidPhone) {
  return
}

{password && password.length < 8 ? (
  <p className="mt-1 text-xs text-red-500">
    Password must be at least 8 characters.
  </p>
) : null}

  setSaving(true)

  try {
    // backend update later

    setIsEditing(false)
  } finally {
    setSaving(false)
  }
}

  const initials = `${domesticApprover.firstName?.[0] ?? ''}${
    domesticApprover.lastName?.[0] ?? ''
  }`.toUpperCase()

  return (
      <div className="space-y-6">
        <Card className="border-border overflow-hidden">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-lg font-bold text-primary">
              {initials || <UserCircle className="h-7 w-7" />}
            </div>

            <div className="min-w-0">
              <p
                className="font-semibold text-foreground"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {domesticApprover.firstName}{' '}
                {domesticApprover.lastName}
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
                {isEditing
                  ? 'Update your domestic approver information.'
                  : 'Your domestic approver account information'}
              </CardDescription>
            </div>

            {!isEditing ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={startEditing}
                aria-label="Edit profile"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            ) : null}
          </CardHeader>

          <CardContent>
            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Email
                  </label>

                  <Input
                    value={domesticApprover.email}
                    disabled
                    className="bg-muted/40"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    First name
                  </label>

                  <Input
                    value={firstName}
                    onChange={(e) =>
                      setFirstName(e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Last name
                  </label>

                  <Input
                    value={lastName}
                    onChange={(e) =>
                      setLastName(e.target.value)
                    }
                    required
                  />
                </div>
                <div>
  <label className="mb-1 block text-xs text-muted-foreground">
    Contact number
  </label>

  <Input
    type="tel"
    value={contactPhone}
    onChange={(e) => {
      const value = e.target.value.replace(/\D/g, '')
      if (value.length <= 11) {
        setContactPhone(value)
      }
    }}
    placeholder="09XXXXXXXXX"
    required
    minLength={11}
    maxLength={11}
  />

  {contactPhone.length > 0 && !/^09\d{9}$/.test(contactPhone) ? (
    <p className="mt-1 text-xs text-red-500">
      Contact number must be exactly 11 digits.
    </p>
  ) : null}
</div>
<div>
  <label className="mb-1 block text-xs text-muted-foreground">
    New password
  </label>

  <Input
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="Leave blank to keep current password"
  />
</div>
<div>
  <label className="mb-1 block text-xs text-muted-foreground">
    Confirm password
  </label>

  <Input
    type="password"
    value={confirmPassword}
    onChange={(e) =>
      setConfirmPassword(e.target.value)
    }
    placeholder="Confirm new password"
  />

  {password &&
  confirmPassword &&
  password !== confirmPassword ? (
    <p className="mt-1 text-xs text-red-500">
      Passwords do not match.
    </p>
  ) : null}
</div>
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelEditing}
                    disabled={saving}
                  >
                    Cancel
                  </Button>

                  <Button
  type="submit"
  disabled={
    saving ||
    contactPhone.length !== 11 ||
    (password !== '' &&
      password !== confirmPassword)
  }
>
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Save changes'
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <dl className="grid gap-4 text-sm">
                <div className="flex items-start gap-3">
                  <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                  <div>
                    <dt className="text-xs text-muted-foreground">
                      Full name
                    </dt>

                    <dd className="font-medium">
                      {domesticApprover.firstName}{' '}
                      {domesticApprover.lastName}
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
  <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

  <div>
    <dt className="text-xs text-muted-foreground">
      Contact number
    </dt>

    <dd>
      {domesticApprover.contactPhone || 'Not set'}
    </dd>
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
            )}
          </CardContent>
        </Card>
      </div>
  )
}
