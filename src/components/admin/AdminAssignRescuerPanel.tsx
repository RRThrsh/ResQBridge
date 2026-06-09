import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery } from 'convex/react'
import { Loader2, UserPlus } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { DoubleConfirmation } from '@/components/DoubleConfirmation'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { normalizeEmail } from '@/lib/admin'
import {
  canAdminAssignRescuer,
  statusLabel,
  type AdminStoredReport,
} from '@/lib/reports'
import { toast } from 'sonner'

type Props = {
  report: AdminStoredReport
  adminEmail: string
  rescuerEmail: string
  onRescuerEmailChange: (email: string) => void
  onAssigned?: () => void
  compact?: boolean
}

export function AdminAssignRescuerPanel({
  report,
  adminEmail,
  rescuerEmail,
  onRescuerEmailChange,
  onAssigned,
  compact = false,
}: Props) {
  const assignRescuer = useMutation(api.admin.assignRescuerToReport)
  const rescuers = useQuery(api.rescuers.listRescuers, {
    adminEmail: normalizeEmail(adminEmail),
  })
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  if (!canAdminAssignRescuer(report.status)) {
    return null
  }

  const isPending = report.status === 'pending'
  const selectedRescuer = rescuers?.find((r) => r.email === rescuerEmail)
  const selectedLabel = selectedRescuer
    ? `${selectedRescuer.firstName} ${selectedRescuer.lastName}`
    : rescuerEmail

  async function handleAssign() {
    if (!rescuerEmail) {
      toast.error('Select a rescuer to assign')
      return
    }
    setSaving(true)
    try {
      await assignRescuer({
        adminEmail: normalizeEmail(adminEmail),
        reportId: report.id as Id<'reports'>,
        rescuerEmail,
      })
      toast.success(
        isPending ? 'Report accepted and assigned' : 'Rescuer assigned to report',
      )
      setConfirmOpen(false)
      onAssigned?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not assign rescuer')
    } finally {
      setSaving(false)
    }
  }

  if (rescuers === undefined) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (rescuers.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-sm">
        <p className="font-medium text-foreground">No rescuers yet</p>
        <p className="mt-1 text-muted-foreground">
          Add field rescuers before you can dispatch this report.
        </p>
        <Link
          to="/pwrcc/admin/rescuers"
          className="mt-3 inline-flex h-8 items-center justify-center rounded-md border border-border bg-background px-3 text-xs font-medium hover:bg-muted"
        >
          Manage rescuers
        </Link>
      </div>
    )
  }

  return (
    <>
      <div
        className={
          compact
            ? 'space-y-3'
            : 'rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-3'
        }
      >
        {!compact ? (
          <div className="flex items-start gap-2">
            <UserPlus className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {isPending ? 'Accept & assign rescuer' : 'Assign rescuer'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isPending
                  ? 'Accepts this report and sends it to the rescuer’s dashboard.'
                  : `Status: ${statusLabel(report.status)}. Change who is handling this rescue.`}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm font-medium">
            {isPending ? 'Accept & assign rescuer' : 'Assign rescuer'}
          </p>
        )}

        <Select value={rescuerEmail} onValueChange={(value) => value && onRescuerEmailChange(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select rescuer" />
          </SelectTrigger>
          <SelectContent>
            {rescuers.map((r) => (
              <SelectItem key={r.email} value={r.email}>
                {r.firstName} {r.lastName} ({r.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          className="w-full"
          variant={isPending ? 'default' : 'outline'}
          disabled={saving || !rescuerEmail}
          onClick={() => setConfirmOpen(true)}
        >
          {isPending ? 'Accept & assign' : report.assignedRescuerEmail ? 'Reassign rescuer' : 'Assign rescuer'}
        </Button>
      </div>

      <DoubleConfirmation
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        step1={{
          title: isPending ? 'Accept and assign report?' : 'Assign rescuer to report?',
          description: "Are you sure you want to proceed?",
          confirmLabel: "Continue",
          cancelLabel: "Back",
        }}
        step2={{
          title: isPending ? 'Confirm acceptance' : 'Confirm assignment',
          description: rescuerEmail
            ? isPending
              ? `Accept this report and assign it to ${selectedLabel}? They will see it in their active assignments.`
              : `Assign this report to ${selectedLabel}? ${
                  report.assignedRescuerName
                    ? `This replaces ${report.assignedRescuerName}.`
                    : 'They will see it in their active assignments.'
                }`
            : 'Select a rescuer before confirming.',
          confirmLabel: isPending ? 'Accept & assign' : 'Assign',
          cancelLabel: "Cancel",
        }}
        confirmVariant="default"
        loading={saving}
        onConfirm={handleAssign}
      />
    </>
  )
}
