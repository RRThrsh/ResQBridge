import { useState } from 'react'
import { useMutation } from 'convex/react'
import { Loader2 } from 'lucide-react'
import { api } from '../../../convex/_generated/api'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { normalizeEmail } from '@/lib/admin'
import { toast } from 'sonner'

type Props = {
  adminEmail: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminAddRescuerDialog({
  adminEmail,
  open,
  onOpenChange,
}: Props) {
  const addRescuer = useMutation(api.rescuers.addRescuer)

  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)

  function resetForm() {
    setEmail('')
    setFirstName('')
    setLastName('')
    setContactPhone('')
    setPassword('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setSaving(true)

    try {
      await addRescuer({
        adminEmail: normalizeEmail(adminEmail),
        email: normalizeEmail(email),
        firstName,
        lastName,
        contactPhone,
        password,
      })

      toast.success('Rescuer added successfully.')

      resetForm()
      onOpenChange(false)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Could not add rescuer',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) resetForm()
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add rescuer</DialogTitle>
          <DialogDescription>
            Create a rescuer account with password login and OTP verification.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-3">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              First name
            </label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Last name
            </label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
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
              onChange={(e) => setContactPhone(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Password
            </label>
            <Input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <DialogFooter className="pt-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Add rescuer'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
