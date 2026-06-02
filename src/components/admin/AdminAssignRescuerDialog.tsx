import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AdminAssignRescuerPanel } from '@/components/admin/AdminAssignRescuerPanel'
import { Badge } from '@/components/ui/badge'
import {
  formatReporterName,
  statusLabel,
  type AdminStoredReport,
} from '@/lib/reports'

type Props = {
  report: AdminStoredReport | null
  adminEmail: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminAssignRescuerDialog({
  report,
  adminEmail,
  open,
  onOpenChange,
}: Props) {
  const [rescuerEmail, setRescuerEmail] = useState('')

  const syncKey = open && report ? `${report.id}:${report.assignedRescuerEmail ?? ''}` : null
  const [prevSyncKey, setPrevSyncKey] = useState<string | null>(null)
  if (syncKey !== prevSyncKey) {
    setPrevSyncKey(syncKey)
    if (syncKey && report) {
      setRescuerEmail(report.assignedRescuerEmail ?? '')
    }
  }

  if (!report) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign rescuer</DialogTitle>
          <DialogDescription>
            {report.reportNumber ?? report.id} · {report.animalName} ·{' '}
            {formatReporterName(report.reporterFirstName, report.reporterLastName)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="capitalize">
            {report.category}
          </Badge>
          <Badge variant="default">{statusLabel(report.status)}</Badge>
        </div>

        {report.assignedRescuerName ? (
          <p className="text-sm text-muted-foreground">
            Currently assigned:{' '}
            <span className="font-medium text-foreground">{report.assignedRescuerName}</span>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">No rescuer assigned yet.</p>
        )}

        <AdminAssignRescuerPanel
          report={report}
          adminEmail={adminEmail}
          rescuerEmail={rescuerEmail}
          onRescuerEmailChange={setRescuerEmail}
          onAssigned={() => onOpenChange(false)}
          compact
        />
      </DialogContent>
    </Dialog>
  )
}
