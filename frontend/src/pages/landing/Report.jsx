import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, DoubleConfirmation, InfoPopover } from '../../components/ui'
import species from '../../data/wildlifeSpecies'

const API_BASE = '/api/v1'

const REPORT_INFO = {
  wildlife_sighting: { label: 'Wildlife Sighting', description: 'Report wildlife observed in its natural habitat that does not require immediate rescue or intervention.' },
  injured_wildlife: { label: 'Injured Wildlife', description: 'Report wildlife that is injured, sick, or unable to survive without assistance and requires immediate rescue.' },
  trapped_wildlife: { label: 'Trapped Wildlife', description: 'Report wildlife that is trapped, entangled, confined, or unable to escape from a dangerous situation.' },
  illegal_possession: { label: 'Illegal Wildlife Possession', description: 'Report suspected cases of individuals keeping, transporting, selling, or possessing wildlife without proper authorization or permits.' },
  human_wildlife_conflict: { label: 'Human–Wildlife Conflict', description: 'Report incidents where wildlife poses a threat to people or property, or where people are threatening or harming wildlife.' },
}

const URGENCY_LEVELS = [
  { value: 'low', label: 'Low', class: 'bg-gray-100 text-gray-700 border-gray-200' },
  { value: 'medium', label: 'Medium', class: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'high', label: 'High', class: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'emergency', label: 'Emergency', class: 'bg-red-50 text-red-700 border-red-200' },
]

export default function Report() {
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    category: '',
    animalType: '',
    urgency: '',
    location: '',
    description: '',
    latitude: '',
    longitude: '',
  })
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [gettingLocation, setGettingLocation] = useState(false)
  const [speciesOpen, setSpeciesOpen] = useState(false)
  const [speciesQuery, setSpeciesQuery] = useState('')
  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value })
  }

  function handleImages(e) {
    const files = Array.from(e.target.files || [])
    const remaining = 5 - imageFiles.length
    const selected = files.slice(0, remaining)
    setImageFiles((prev) => [...prev, ...selected])
    setImagePreviews((prev) => [...prev, ...selected.map((f) => URL.createObjectURL(f))])
  }

  function removeImage(index) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
    if (fileRef.current) fileRef.current.value = ''
  }

  function getLocation() {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }
    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({ ...prev, latitude: pos.coords.latitude.toString(), longitude: pos.coords.longitude.toString() }))
        setGettingLocation(false)
      },
      () => {
        setError('Could not get your location. Please allow location access or enter manually.')
        setGettingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('phone', form.phone ? '+63' + form.phone : '')
      fd.append('category', form.category)
      fd.append('animalType', form.animalType)
      fd.append('urgency', form.urgency)
      fd.append('location', form.location)
      fd.append('description', form.description)
      if (form.latitude) fd.append('latitude', form.latitude)
      if (form.longitude) fd.append('longitude', form.longitude)
      imageFiles.forEach((f) => fd.append('images', f))

      const res = await fetch(`${API_BASE}/report`, {
        method: 'POST',
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to submit report.')
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-1 items-center justify-center bg-green-50 px-6">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Report Submitted</h1>
          <p className="mt-3 text-sm text-gray-500">
            Thank you. Your report has been received and our team will follow up shortly.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button onClick={() => navigate('/')}>Back to Home</Button>
            <Button variant="outline" onClick={() => { setSubmitted(false); setForm({ name: '', phone: '', category: '', animalType: '', urgency: '', location: '', description: '', latitude: '', longitude: '' }); setImageFiles([]); setImagePreviews([]); if (fileRef.current) fileRef.current.value = '' }}>
              Submit Another
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-gray-50 px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Report an Animal</h1>
          <p className="mt-2 text-sm text-gray-500">
            Report a wildlife sighting, stray animal, or rescue emergency.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-gray-200 bg-white px-8 py-10 shadow-sm">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Your Name <span className="text-gray-400">(optional)</span></label>
              <input
                type="text"
                value={form.name}
                onChange={update('name')}
                className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500"
                placeholder="Juan Dela Cruz"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contact Phone <InfoPopover>Your contact number will only be used by authorized personnel to verify your report and coordinate the appropriate response.</InfoPopover>
              </label>
              <div className="mt-1.5 flex">
                <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-100 px-3 text-sm text-gray-600">+63</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={form.phone}
                  onBeforeInput={(e) => { if (e.data && /\D/.test(e.data)) e.preventDefault() }}
                  onPaste={(e) => {
                    const text = (e.clipboardData || window.clipboardData).getData('text')
                    if (text && /\D/.test(text)) e.preventDefault()
                  }}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  className="block w-full rounded-r-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  placeholder="9XX XXX XXXX"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Report Type
              {form.category && <InfoPopover>
                <div>
                  <p className="font-semibold">{REPORT_INFO[form.category]?.label}</p>
                  <p className="mt-1 text-gray-300">{REPORT_INFO[form.category]?.description}</p>
                </div>
              </InfoPopover>}
            </label>
            <select
              value={form.category}
              onChange={update('category')}
              className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500"
              required
            >
              <option value="">Select report type</option>
              <option value="wildlife_sighting">Wildlife Sighting</option>
              <option value="injured_wildlife">Injured Wildlife</option>
              <option value="trapped_wildlife">Trapped Wildlife</option>
              <option value="illegal_possession">Illegal Wildlife Possession</option>
              <option value="human_wildlife_conflict">Human–Wildlife Conflict</option>
            </select>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">
                Species <InfoPopover>
                  <p className="font-semibold">Species</p>
                  <p className="mt-1 text-gray-300">Search and select the wildlife species from the Wildlife Guide. The list is automatically loaded from the Wildlife Guide database. If you are unable to identify the species, select Unknown Species.</p>
                </InfoPopover>
              </label>
              <div className="relative mt-1.5">
                <input
                  type="text"
                  value={speciesQuery}
                  onChange={(e) => {
                    setSpeciesQuery(e.target.value)
                    setForm((prev) => ({ ...prev, animalType: '' }))
                    setSpeciesOpen(true)
                  }}
                  onFocus={() => {
                    setSpeciesQuery(form.animalType || '')
                    setSpeciesOpen(true)
                  }}
                  onBlur={() => setTimeout(() => setSpeciesOpen(false), 200)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  placeholder="Search species..."
                  required
                />
                <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                {speciesOpen && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                    {(speciesQuery && speciesQuery !== form.animalType
                      ? species.filter((s) => s.name.toLowerCase().includes(speciesQuery.toLowerCase()))
                      : species
                    ).map((s) => (
                      <button
                        key={s.name}
                        type="button"
                        onMouseDown={() => { setForm((prev) => ({ ...prev, animalType: s.name })); setSpeciesQuery(s.name); setSpeciesOpen(false) }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-green-50"
                      >
                        {s.name}
                      </button>
                    ))}
                    <button
                      type="button"
                      onMouseDown={() => { setForm((prev) => ({ ...prev, animalType: 'Unknown Species' })); setSpeciesQuery('Unknown Species'); setSpeciesOpen(false) }}
                      className="flex w-full items-center gap-2 border-t border-gray-100 px-4 py-2.5 text-left text-sm text-gray-500 italic hover:bg-green-50"
                    >
                      Unknown Species
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Urgency</label>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {URGENCY_LEVELS.map((u) => (
                  <button
                    key={u.value}
                    type="button"
                    onClick={() => setForm({ ...form, urgency: u.value })}
                    className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${form.urgency === u.value ? 'ring-2 ring-green-500 ring-offset-1 ' + u.class : u.class}`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={update('location')}
              className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500"
              placeholder="Barangay, city, or landmark"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Pin Location <span className="text-gray-400">(optional)</span></label>
            <div className="mt-1.5 space-y-3">
              <button
                type="button"
                onClick={getLocation}
                disabled={gettingLocation}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-600 transition hover:border-green-500 hover:text-green-600 disabled:opacity-50"
              >
                {gettingLocation ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                )}
                {gettingLocation ? 'Getting location...' : 'Get Current Location'}
              </button>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400">Latitude</label>
                  <input
                    type="text"
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                    className="mt-0.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    placeholder="14.5995"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400">Longitude</label>
                  <input
                    type="text"
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                    className="mt-0.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    placeholder="120.9842"
                  />
                </div>
              </div>
              {form.latitude && form.longitude && (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <iframe
                    title="Map preview"
                    width="100%"
                    height="220"
                    frameBorder="0"
                    scrolling="no"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(form.longitude) - 0.01},${parseFloat(form.latitude) - 0.01},${parseFloat(form.longitude) + 0.01},${parseFloat(form.latitude) + 0.01}&layer=mapnik&marker=${parseFloat(form.latitude)},${parseFloat(form.longitude)}`}
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={update('description')}
              className="mt-1.5 w-full resize-y rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500"
              placeholder="Describe the animal's condition, behavior, and any immediate concerns..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Photos <span className="text-gray-400">(up to 5, optional)</span></label>
            <div className="mt-1.5">
              <input ref={fileRef} type="file" accept="image/*" multiple capture="environment" onChange={handleImages} className="hidden" />
              {imagePreviews.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-3">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative inline-block">
                      <img src={src} alt={`Preview ${i + 1}`} className="h-24 w-36 rounded-lg object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs shadow hover:bg-red-600"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {imageFiles.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 transition hover:border-green-500 hover:text-green-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  {imageFiles.length === 0 ? 'Add photos' : 'Add more'}
                </button>
              )}
            </div>
          </div>

          <DoubleConfirmation
            onConfirm={handleSubmit}
            title="Submit Animal Report"
            message="Are you sure you want to submit this animal rescue report? It will be sent to rescue teams for response."
            confirmText="Yes, Submit Report"
            triggerVariant="primary"
          >
            <Button type="button" isLoading={submitting} size="lg" className="w-full">
              {submitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </DoubleConfirmation>
        </form>
      </div>
    </div>
  )
}
