import { useState } from 'react'
import {
  AlertTriangle,
  Bird,
  CheckCircle2,
  Edit,
  Loader2,
  MapPin,
  Phone,
  Save,
  Trash,
  User,
  UserPlus
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ReportPhotosGallery } from '@/components/report/ReportPhotosGallery'
import { formatDateTime } from '@/lib/dates'
import {
  formatReporterName,
  statusLabel,
  type AdminStoredReport,
  type ReportCategory,
} from '@/lib/reports'
import { getReportPhotos } from '@/lib/reportPhotos'

type AdminReportDetailProps = {
  report: AdminStoredReport
  category: ReportCategory
  initialMode?: 'view' | 'edit'
  readOnly?: boolean
  onClose?: () => void
  onSave?: (updatedData: Partial<AdminStoredReport>) => Promise<void>
  onAssign?: () => void
  onDelete?: () => void
}

export function AdminReportDetailView({
  report,
  category,
  initialMode = 'view',
  readOnly = false,
  onClose,
  onSave,
  onAssign,
  onDelete,
}: AdminReportDetailProps) {
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode)
  const [loading, setLoading] = useState(false)
  const [statusBanner, setStatusBanner] = useState<string | null>(null)

  // Editable state
  const [animalName, setAnimalName] = useState(report.animalName)
  const [location, setLocation] = useState(report.location)
  const [description, setDescription] = useState(report.description || '')

  const reporterName = formatReporterName(report.reporterFirstName, report.reporterLastName)
  const mapQuery = report.latitude && report.longitude 
    ? `${report.latitude},${report.longitude}` 
    : encodeURIComponent(report.location)

  async function handleSave() {
    if (!onSave) return
    setLoading(true)
    try {
      await onSave({
        animalName,
        location,
        description,
      })
      setStatusBanner('Report updated successfully.')
      setMode('view')
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const actionFooter = (
    <div className="mx-auto max-w-2xl space-y-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-6">
      {mode === 'edit' ? (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-12 flex-1 rounded-xl text-base font-semibold"
            disabled={loading}
            onClick={() => setMode('view')}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-12 flex-1 rounded-xl text-base font-semibold"
            disabled={loading}
            onClick={handleSave}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            Save Changes
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          {!readOnly && (
            <Button
              type="button"
              className="h-12 flex-1 rounded-xl bg-emerald-600 text-base font-semibold hover:bg-emerald-700"
              onClick={onAssign}
            >
              <UserPlus className="mr-2 h-5 w-5" />
              Assign Rescuer
            </Button>
          )}
          
          <div className="flex gap-2 flex-1">
            {!readOnly && (
              <Button
                type="button"
                variant="outline"
                className="h-12 flex-1 rounded-xl text-base font-semibold"
                onClick={() => setMode('edit')}
              >
                <Edit className="mr-2 h-5 w-5" />
                Edit
              </Button>
            )}
            
            {onDelete && (
              <Button
                type="button"
                variant="outline"
                className="h-12 flex-1 rounded-xl border-destructive/40 text-base font-semibold text-destructive hover:bg-destructive/10"
                onClick={onDelete}
              >
                <Trash className="mr-2 h-5 w-5" />
                Delete
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="relative flex min-h-full flex-col bg-muted/10">
      <div className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-4 py-6 sm:px-6">
        
        {/* Header Section */}
        <div className="text-center">
          <Badge
            variant={
              report.status === 'pending' || report.status === 'accepted'
                ? 'default'
                : 'secondary'
            }
            className="mb-4 px-3 py-1 text-sm uppercase tracking-wider"
          >
            {statusLabel(report.status)}
          </Badge>
          <p className="text-xs font-mono text-muted-foreground">
            {report.reportNumber ?? report.id}
          </p>
        </div>

        {statusBanner ? (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {statusBanner}
          </div>
        ) : null}

        {getReportPhotos(report).length > 0 ? (
          <ReportPhotosGallery
            photos={getReportPhotos(report)}
            alt={report.animalName}
            variant="hero"
          />
        ) : null}

        {/* Details Section */}
        <AdminDetailSection
          title={category === 'wildlife' ? 'Wildlife details' : 'Domestic details'}
          icon={Bird}
        >
          <div className="space-y-1 mb-4">
            <span className="text-xs text-muted-foreground font-medium">Reported Animal</span>
            {mode === 'edit' ? (
              <Input 
                value={animalName} 
                onChange={(e) => setAnimalName(e.target.value)} 
                className="mt-1 font-bold" 
              />
            ) : (
              <p className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                {report.animalName}
              </p>
            )}
          </div>

          <dl className="space-y-3">
            <DetailRow label="Date & time seen" value={formatDateTime(report.createdAt)} />
            <DetailRow label="Quantity" value={String(report.quantity ?? 1)} />
            <DetailRow label="Size" value={report.reportedSize ?? 'Not provided'} />
            <DetailRow
              label="Condition / behavior"
              value={report.condition ? report.condition.replace(/-/g, ' ') : 'Not provided'}
              highlight
            />
            
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Additional Details</dt>
              {mode === 'edit' ? (
                <Textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  className="mt-1 resize-none" 
                  rows={3}
                />
              ) : (
                <dd className="mt-0.5 font-medium text-sm leading-relaxed">
                  {report.description || 'None provided'}
                </dd>
              )}
            </div>
          </dl>
        </AdminDetailSection>

        {/* Location Section */}
        <AdminDetailSection title="Location" icon={MapPin}>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-medium">Address / Landmark</span>
            {mode === 'edit' ? (
              <Input 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                className="mt-1" 
              />
            ) : (
              <p className="font-medium leading-relaxed text-sm">{report.location}</p>
            )}
          </div>
          
          {mode === 'view' && (
            <div className="mt-4 space-y-3">
              <div className="w-full h-48 sm:h-64 rounded-xl overflow-hidden border border-border bg-muted">
                <iframe
                  title="Admin Map Viewport"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${mapQuery}`}
                />
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted shadow-sm"
              >
                <MapPin className="h-4 w-4 text-primary" />
                View on Google Maps
              </a>
            </div>
          )}
        </AdminDetailSection>

        {/* Reporter Section */}
        <AdminDetailSection title="Reporter" icon={User}>
          <dl className="space-y-3">
            <DetailRow label="Name" value={reporterName} />
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Contact</dt>
              <dd className="mt-1 font-medium">
                {report.reporterPhone ? (
                  <a
                    href={`tel:${report.reporterPhone.replace(/\s/g, '')}`}
                    className="inline-flex items-center gap-2 text-primary hover:opacity-80"
                  >
                    {report.reporterPhone}
                    <Phone className="h-4 w-4" />
                  </a>
                ) : (
                  'Not provided'
                )}
              </dd>
            </div>
          </dl>
        </AdminDetailSection>
      </div>

      {/* Sticky Action Footer */}
      <div className="sticky bottom-0 z-10 border-t border-border/50 bg-background/80 backdrop-blur-xl">
        {actionFooter}
      </div>
    </div>
  )
}

// Sub-components
function DetailRow({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className={`mt-0.5 font-medium ${highlight ? 'text-primary' : ''}`}>{value}</dd>
    </div>
  )
}

function AdminDetailSection({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: any
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border/50 bg-muted/30 px-4 py-3">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  )
}
