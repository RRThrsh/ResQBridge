import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, AlertTriangle, Loader2, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUserAuth } from '@/context/UserAuthContext'
import { toast } from 'sonner'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { normalizeEmail } from '@/lib/admin'
import { ReportContactField } from '@/components/report/ReportContactField'
import { ReportPhotoField } from '@/components/report/ReportPhotoField'
import {
  photoStorageIdsForSubmit,
  validateReportPhotosForSubmit,
  type ReportPhotoItem,
} from '@/lib/reportPhotos'

export function DomesticReportForm() {
  const navigate = useNavigate()
  const { user } = useUserAuth()
  const createReportMutation = useMutation(api.reports.create)
  const profile = useQuery(
    api.users.getProfile,
    user ? { email: normalizeEmail(user.email) } : 'skip',
  )
  const [loading, setLoading] = useState(false)
  const [reportType, setReportType] = useState('missing')
  const [photos, setPhotos] = useState<ReportPhotoItem[]>([])
  const [formData, setFormData] = useState({
    species: '',
    animalName: '',
    color: '',
    location: '',
    description: '',
    reporterPhone: '',
    quantity: '1',
    reportedSize: '',
    seenAt: '',
  })

  // --- NEW FIX: AUTO-POPULATE PHONE NUMBER ---
  // Safely loads the profile number into the editable form state 
  useEffect(() => {
    // Extract to a local variable to preserve TypeScript narrowing
    const phone = profile?.contactPhone;
    
    if (phone) {
      setFormData((prev) => {
        if (!prev.reporterPhone) {
          let cleaned = phone.replace(/\D/g, '')
          if (cleaned.length > 11) cleaned = cleaned.slice(0, 11)
          return { ...prev, reporterPhone: cleaned }
        }
        return prev
      })
    }
  }, [profile?.contactPhone])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please log in to submit a report')
      return
    }
    if (!formData.species.trim() || !formData.location || !formData.description) {
      toast.error('Please fill in all required fields')
      return
    }
    const photoError = validateReportPhotosForSubmit(photos)
    if (photoError) {
      toast.error(photoError)
      return
    }

    if (profile === undefined) {
      toast.error('Still loading your account details. Please try again.')
      return
    }

    // --- FIX: NO MORE PROFILE OVERRIDE ---
    // Strictly trust whatever is in the input box right now.
    const contactPhone = formData.reporterPhone.trim()
    
    if (!contactPhone) {
      toast.error('Contact number is required')
      return
    }

    // --- VALIDATION LOGIC ---
    // Enforces exact 11 digits, strictly starting with "09"
    const cleanPhone = contactPhone.replace(/\D/g, '')
    if (!/^09\d{9}$/.test(cleanPhone)) {
      toast.error('Contact number must be exactly 11 digits and start with "09"')
      return
    }

    setLoading(true)

    const descriptionParts = [formData.description]
    if (formData.color) {
      descriptionParts.unshift(`Color/markings: ${formData.color}`)
    }

    try {
      const seenAt = formData.seenAt
        ? new Date(formData.seenAt).getTime()
        : Date.now()

      await createReportMutation({
        userEmail: user.email,
        category: 'domestic',
        type: reportType,
        animalName:
          formData.animalName ||
          (reportType === 'missing' ? 'Unknown Pet' : 'Stray/Found Animal'),
        location: formData.location,
        description: descriptionParts.join('\n\n'),
        speciesId: formData.species.trim(),
        reporterPhone: cleanPhone, // Saving strictly cleaned phone number
        quantity: Math.max(1, Number(formData.quantity) || 1),
        reportedSize: formData.reportedSize.trim() || undefined,
        seenAt,
        photoStorageIds: photoStorageIdsForSubmit(photos),
      })
      navigate('/report/success')
    } catch {
      toast.error('Could not submit report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
      
      {/* --- DISCLAIMER NOTE --- */}
      <div className="mb-8 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/10 p-4 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p>
          <strong className="font-semibold text-foreground">Important Note:</strong> This report concerns domestic animals. Please note that domestic animal rescue and shelter services are managed by <strong>Nativity's Stray Rescue Shelter</strong>, not PWRCC.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          Domestic Animal Report
        </h2>
        <p className="text-sm text-muted-foreground">
          Report a missing pet, found animal, stray, or injured domestic animal (dogs, cats, etc).
        </p>
      </div>

      <Tabs value={reportType} onValueChange={setReportType} className="mb-8 w-full">
        <TabsList className="grid w-full grid-cols-4 bg-background border border-border h-12 p-1">
          <TabsTrigger value="missing" className="h-full rounded-lg text-xs aria-selected:bg-primary aria-selected:text-primary-foreground">Missing</TabsTrigger>
          <TabsTrigger value="found" className="h-full rounded-lg text-xs aria-selected:bg-primary aria-selected:text-primary-foreground">Found</TabsTrigger>
          <TabsTrigger value="stray" className="h-full rounded-lg text-xs aria-selected:bg-primary aria-selected:text-primary-foreground">Stray</TabsTrigger>
          <TabsTrigger value="injured" className="h-full rounded-lg text-xs aria-selected:bg-primary aria-selected:text-primary-foreground">Injured</TabsTrigger>
        </TabsList>
      </Tabs>

      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Species */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Species <span className="text-destructive">*</span>
            </label>
            <Input
              value={formData.species}
              onChange={(e) => setFormData({ ...formData, species: e.target.value })}
              placeholder="e.g. Dog, Cat, Bird"
              className="h-12 bg-background border-border rounded-xl"
              required
            />
          </div>

          {/* Name */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {reportType === 'missing' ? "Pet's Name *" : 'Name (if known)'}
            </label>
            <Input
              value={formData.animalName}
              onChange={(e) => setFormData({ ...formData, animalName: e.target.value })}
              placeholder="e.g. Bella"
              className="h-12 bg-background border-border rounded-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Color */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Color / Markings
            </label>
            <Input
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="e.g. Black with white paws"
              className="h-12 bg-background border-border rounded-xl"
            />
          </div>

          {/* Location */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Location <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Rizal Ave, PPC"
                className="pl-10 h-12 bg-background border-border rounded-xl"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Date & Time Seen
          </label>
          <Input
            type="datetime-local"
            value={formData.seenAt}
            onChange={(e) => setFormData({ ...formData, seenAt: e.target.value })}
            className="h-12 bg-background border-border rounded-xl"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Reported Quantity
            </label>
            <Input
              type="number"
              min={1}
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="h-12 bg-background border-border rounded-xl"
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Reported Size
            </label>
            <Input
              value={formData.reportedSize}
              onChange={(e) => setFormData({ ...formData, reportedSize: e.target.value })}
              placeholder="e.g. Small, medium"
              className="h-12 bg-background border-border rounded-xl"
            />
          </div>
        </div>

        {user ? (
          <ReportContactField
            userEmail={user.email}
            value={formData.reporterPhone}
            onChange={(val) => {
              // Strip non-numeric characters
              let cleaned = val.replace(/\D/g, '')
              // Enforce 11 character max length on input
              if (cleaned.length > 11) {
                cleaned = cleaned.slice(0, 11)
              }
              setFormData({ ...formData, reporterPhone: cleaned })
            }}
          />
        ) : null}

        {/* Description */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Additional Details <span className="text-destructive">*</span>
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Provide any additional context about the animal..."
            className="min-h-[100px] bg-background border-border rounded-xl resize-none"
            required
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Photos <span className="text-destructive">*</span>
          </label>
          <ReportPhotoField value={photos} onChange={setPhotos} />
        </div>

        {/* Warning */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-xs text-amber-500/80 leading-relaxed">
            By submitting this report, it will be posted on the public Community Board to help locate or resolve the issue. Your email will be used for follow-up contact.
          </p>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Submit ${reportType} Report`}
        </Button>
      </form>
    </div>
  )
}
