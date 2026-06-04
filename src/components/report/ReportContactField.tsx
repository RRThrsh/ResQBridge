import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Input } from '@/components/ui/input'
import { normalizeEmail } from '@/lib/admin'

type Props = {
  userEmail: string
  value: string
  onChange: (value: string) => void
}

export function ReportContactField({ userEmail, value, onChange }: Props) {
  // 1. Add a state to track if the user wants to edit their saved number
  const [isEditing, setIsEditing] = useState(false)

  const profile = useQuery(api.users.getProfile, {
    email: normalizeEmail(userEmail),
  })

  if (profile === undefined) {
    return (
      <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading contact details…
      </div>
    )
  }

  const savedPhone = profile?.contactPhone?.trim()

  // 2. If they have a saved phone AND they haven't clicked edit, show the read-only view
  if (savedPhone && !isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Contact Number
          </label>
          <button 
            type="button" 
            onClick={() => {
              setIsEditing(true)
              onChange(savedPhone) // Pre-fill the parent's state with the saved number
            }}
            className="text-xs font-medium text-primary hover:underline"
          >
            Change
          </button>
        </div>
        <p className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm font-medium text-foreground">
          {savedPhone}
        </p>
        <p className="text-xs text-muted-foreground">
          Saved on your account for rescue team follow-up.
        </p>
      </div>
    )
  }

  // 3. Render the input field if there is no saved phone OR if isEditing is true
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Contact Number <span className="text-destructive">*</span>
        </label>
        {/* Optional: Allow them to cancel editing and go back to the saved number */}
        {savedPhone && isEditing && (
          <button 
            type="button" 
            onClick={() => {
              setIsEditing(false)
              onChange('') // Clear the parent's state to fall back to the saved one
            }}
            className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
          >
            Cancel
          </button>
        )}
      </div>
      <Input
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="For follow-up from rescue team"
        className="h-12 bg-background border-border rounded-xl"
        required
      />
      <p className="text-xs text-muted-foreground">
        {savedPhone 
          ? "Update the number for this report and future reports." 
          : "Required once per account. You will not need to enter it again on future reports."}
      </p>
    </div>
  )
}
