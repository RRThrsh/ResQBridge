import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useMutation, useQuery } from 'convex/react'
import { Loader2, Pencil } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/context/LanguageContext'
import { useUserAuth } from '@/context/UserAuthContext'
import { normalizeEmail } from '@/lib/admin'
import { formatDate } from '@/lib/dates'
import { toast } from 'sonner'
import { ThemeSetting } from '@/components/theme/ThemeSetting'
import {
  Eye,
  EyeOff,
} from 'lucide-react'
export function AccountPage() {
  const { t } = useLanguage()
  const { isLoggedIn, user, updateUser } = useUserAuth()
  const updateProfile = useMutation(api.users.updateProfile)
  const changePassword = useMutation(
  api.users.resetUserPassword,
)
  // Safely pass the email only if the user object exists
  const profile = useQuery(
    api.users.getProfile,
    user?.email ? { email: normalizeEmail(user.email) } : 'skip',
  )

  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
const [
  currentPassword,
  setCurrentPassword,
] = useState('')

const [
  newPassword,
  setNewPassword,
] = useState('')

const [
  confirmPassword,
  setConfirmPassword,
] = useState('')

const [
  showCurrentPassword,
  setShowCurrentPassword,
] = useState(false)

const [
  showNewPassword,
  setShowNewPassword,
] = useState(false)

const [
  showConfirmPassword,
  setShowConfirmPassword,
] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  if (!isLoggedIn || !user) {
    return <Navigate to="/" replace />
  }

  function startEditing() {
    if (!profile) return
    setFirstName(profile.firstName)
    setLastName(profile.lastName)
    setIsEditing(true)
  }

  function cancelEditing() {
    setIsEditing(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    
    if (!user?.email) {
      toast.error(t('account.toastVerifyError'))
      return
    }

    setSaving(true)
    
    try {
      const updated = await updateProfile({
        email: normalizeEmail(user.email),
        firstName,
        lastName,
        contactPhone: profile?.contactPhone ?? '', 
      })

      updateUser({
        firstName: updated.firstName,
        lastName: updated.lastName,
      })

      toast.success(t('account.toastProfileUpdated'))
      setIsEditing(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('account.toastUpdateError'))
    } finally {
      setSaving(false)
    }
  }
async function handlePasswordChange(
  e: React.FormEvent,
) {
  e.preventDefault()

  if (!user) return

  if (
    newPassword !==
    confirmPassword
  ) {
    toast.error(
      t('account.toastPasswordMismatch'),
    )
    return
  }

  if (
    newPassword.length < 8 ||
    newPassword.length > 16
  ) {
    toast.error(
      t('account.toastPasswordLength'),
    )
    return
  }

  setSaving(true)

  try {
    await changePassword({
      email: normalizeEmail(
        user.email,
      ),
      newPassword,
    })

    toast.success(
      t('account.toastPasswordChanged'),
    )

    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  } catch (error) {
    toast.error(
      error instanceof Error
        ? error.message
        : t('account.toastPasswordError'),
    )
  } finally {
    setSaving(false)
  }
}
  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="mx-auto max-w-lg px-4 sm:px-6">
        <div className="mb-10">
          <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
            <Link to="/" className="transition-colors hover:text-foreground">
              {t('account.breadcrumbHome')}
            </Link>
            <span>/</span>
            <span className="text-foreground">{t('account.breadcrumbCurrent')}</span>
          </div>
          <h1
            className="mb-2 text-3xl font-bold text-foreground sm:text-4xl"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {t('account.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditing ? t('account.editDesc') : t('account.viewDesc')}
          </p>
        </div>

        {profile === undefined ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !profile ? (
          <p className="text-sm text-muted-foreground">
            {t('account.errorLoad')}
          </p>
        ) : (
          <>
          <Card className="mb-6 border-border">
            <CardHeader>
              <CardTitle style={{ fontFamily: 'var(--font-heading)' }}>{t('account.appearanceTitle')}</CardTitle>
              <CardDescription>{t('account.appearanceDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeSetting />
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
              <div className="space-y-1.5">
                <CardTitle style={{ fontFamily: 'var(--font-heading)' }}>{t('account.profileTitle')}</CardTitle>
                <CardDescription>{t('account.profileDesc')}</CardDescription>
              </div>
              {!isEditing ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={startEditing}
                  aria-label={t('account.editProfileLabel')}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              ) : null}
            </CardHeader>
            <CardContent>
              
              {/* --- VIEW MODE --- */}
              {!isEditing ? (
                <dl className="grid gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">{t('account.nameLabel')}</dt>
                    <dd className="font-medium">
                      {profile.firstName} {profile.lastName}
                    </dd>
                  </div>

                  {/* Unified Contact Label */}
                  <div>
                    <dt className="text-xs text-muted-foreground">
  Email
</dt>
                    <dd className="font-medium">{profile.email}</dd>
                  </div>

                  <div>
                    <dt className="text-xs text-muted-foreground">{t('account.memberSince')}</dt>
                    <dd>{formatDate(profile.createdAt)}</dd>
                  </div>
                </dl>
              ) : (
                /* --- EDIT MODE --- */
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">{t('account.firstNameLabel')}</label>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">{t('account.lastNameLabel')}</label>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                  
                  {/* Unified Read-Only Contact Field */}
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">
  Email
</label>
                    <Input
                      value={profile.email}
                      disabled
                      className="bg-muted/40 cursor-not-allowed text-muted-foreground font-medium"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cancelEditing}
                      disabled={saving}
                      className="rounded-xl"
                    >
                      {t('account.cancel')}
                    </Button>
                    <Button type="submit" disabled={saving} className="rounded-xl">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t('account.saveChanges')}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
          
          {isEditing ? (
  <Card className="mt-6 border-border">
    <CardHeader>
      <CardTitle
        style={{
          fontFamily:
            'var(--font-heading)',
        }}
      >
        {t('account.passwordTitle')}
      </CardTitle>

      <CardDescription>
        {t('account.passwordDesc')}
      </CardDescription>
    </CardHeader>

    <CardContent>
      <form
        onSubmit={
          handlePasswordChange
        }
        className="space-y-4"
      >
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            {t('account.currentPassword')}
          </label>

          <div className="relative">
            <Input
              type={
                showCurrentPassword
                  ? 'text'
                  : 'password'
              }
              value={
                currentPassword
              }
              onChange={(e) =>
                setCurrentPassword(
                  e.target.value,
                )
              }
              required
            />

            <button
              type="button"
              onClick={() =>
                setShowCurrentPassword(
                  !showCurrentPassword,
                )
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showCurrentPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div>
<label className="mb-1 block text-xs text-muted-foreground">
  {t('account.newPassword')}
</label>

          <div className="relative">
            <Input
              type={
                showNewPassword
                  ? 'text'
                  : 'password'
              }
              value={newPassword}
              onChange={(e) =>
                setNewPassword(
                  e.target.value,
                )
              }
              required
            />

            <button
              type="button"
              onClick={() =>
                setShowNewPassword(
                  !showNewPassword,
                )
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            {t('account.confirmPassword')}
          </label>

          <div className="relative">
            <Input
              type={
                showConfirmPassword
                  ? 'text'
                  : 'password'
              }
              value={
                confirmPassword
              }
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value,
                )
              }
              required
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(
                  !showConfirmPassword,
                )
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            t('account.changePassword')
          )}
        </Button>
      </form>
    </CardContent>
  </Card>
) : null}
</>
        )}
      </div>
    </div>
  )
}
