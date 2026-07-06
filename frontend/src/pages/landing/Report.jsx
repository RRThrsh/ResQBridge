import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, DoubleConfirmation, InfoPopover } from '../../components/ui'
import species from '../../data/wildlifeSpecies'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl })

function LocationMarker({ form, setForm }) {
  const lat = parseFloat(form.latitude)
  const lng = parseFloat(form.longitude)
  const position = isNaN(lat) || isNaN(lng) ? null : [lat, lng]

  useMapEvents({
    click(e) {
      setForm((prev) => ({ ...prev, latitude: e.latlng.lat.toString(), longitude: e.latlng.lng.toString() }))
    },
  })

  if (!position) return null

  return (
    <Marker
      position={position}
      draggable
      eventHandlers={{
        dragend(e) {
          const { lat, lng } = e.target.getLatLng()
          setForm((prev) => ({ ...prev, latitude: lat.toString(), longitude: lng.toString() }))
        },
      }}
    />
  )
}

function MapCentered({ form, locateTrigger }) {
  const lat = parseFloat(form.latitude)
  const lng = parseFloat(form.longitude)
  const position = isNaN(lat) || isNaN(lng) ? null : [lat, lng]

  const map = useMap()
  useEffect(() => {
    if (position) map.setView(position, 16)
  }, [map, position, locateTrigger])

  return null
}

const API_BASE = '/api/v1'

const REPORT_INFO = {
  wildlife_sighting: { label: 'Wildlife Sighting', description: 'Use this report type to report the observation of wildlife in any location. Whether the animal is healthy, injured, sick, or trapped, select its condition using the Wildlife Condition field.' },
  illegal_possession: { label: 'Illegal Wildlife Possession', description: 'Report suspected cases of individuals keeping, transporting, selling, or possessing wildlife without proper authorization or permits.' },
  human_wildlife_conflict: { label: 'Human–Wildlife Conflict', description: 'Report incidents where wildlife poses a threat to people or property, or where people are threatening or harming wildlife.' },
}

export default function Report() {
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    category: '',
    animalType: '',
    wildlifeCondition: '',
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
  const [locateTrigger, setLocateTrigger] = useState(0)
  const [speciesOpen, setSpeciesOpen] = useState(false)
  const [speciesQuery, setSpeciesQuery] = useState('')
  const speciesRef = useRef(null)
  const searchRef = useRef(null)
  useEffect(() => {
    if (!speciesOpen) return
    function handleClick(e) {
      if (speciesRef.current && !speciesRef.current.contains(e.target)) {
        setSpeciesOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [speciesOpen])
  useEffect(() => {
    if (speciesOpen) searchRef.current?.focus()
  }, [speciesOpen])
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
        setLocateTrigger((c) => c + 1)
      },
      () => {
        setError('Could not get your location. Please allow location access and try again.')
        setGettingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 15000 },
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (imageFiles.length === 0) {
      setError('Please upload at least one supporting photo.')
      return
    }
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('phone', form.phone ? '+63' + form.phone : '')
      fd.append('category', form.category)
      fd.append('animalType', form.animalType)
      fd.append('wildlifeCondition', form.wildlifeCondition)
      fd.append('location', form.location)
      fd.append('description', form.description)
      fd.append('latitude', form.latitude)
      fd.append('longitude', form.longitude)
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
            <Button variant="outline" onClick={() => { setSubmitted(false); setForm({ name: '', phone: '', category: '', animalType: '', wildlifeCondition: '', location: '', description: '', latitude: '', longitude: '' }); setImageFiles([]); setImagePreviews([]); if (fileRef.current) fileRef.current.value = '' }}>
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

          <div className="grid gap-6 sm:grid-cols-2">
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
              <option value="illegal_possession">Illegal Wildlife Possession</option>
                <option value="human_wildlife_conflict">Human–Wildlife Conflict</option>
              </select>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">
                Species <InfoPopover>
                  <p className="font-semibold">Species</p>
                  <p className="mt-1 text-gray-300">Search and select the wildlife species from the Wildlife Guide. The list is automatically loaded from the Wildlife Guide database. If you are unable to identify the species, select Unknown Species.</p>
                </InfoPopover>
              </label>
              <div className="relative mt-1.5" ref={speciesRef}>
                <input type="hidden" name="animalType" value={form.animalType} required />
                <button
                  type="button"
                  onClick={() => { setSpeciesOpen((o) => !o); if (!speciesOpen) { setSpeciesQuery('') } }}
                  className="flex w-full items-center justify-between rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500"
                >
                  <span className={form.animalType ? '' : 'text-gray-400'}>{form.animalType || 'Select species'}</span>
                  <svg className={`h-4 w-4 text-gray-400 transition ${speciesOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {speciesOpen && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg">
                    <div className="border-b border-gray-100 p-2">
                      <input
                        ref={searchRef}
                        type="text"
                        value={speciesQuery}
                        onChange={(e) => setSpeciesQuery(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                        placeholder="Search species..."
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {(speciesQuery
                        ? species.filter((s) => s.name.toLowerCase().includes(speciesQuery.toLowerCase()))
                        : species
                      ).map((s) => (
                        <button
                          key={s.name}
                          type="button"
                        onMouseDown={() => { setForm((prev) => ({ ...prev, animalType: s.name })); setSpeciesQuery(''); setSpeciesOpen(false) }}
                              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-green-50"
                            >
                              {s.name}
                            </button>
                          ))}
                          <button
                            type="button"
                            onMouseDown={() => { setForm((prev) => ({ ...prev, animalType: 'Unknown Species' })); setSpeciesQuery(''); setSpeciesOpen(false) }}
                        className="flex w-full items-center gap-2 border-t border-gray-100 px-4 py-2.5 text-left text-sm text-gray-500 italic hover:bg-green-50"
                      >
                        Unknown Species
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Wildlife Condition <InfoPopover>
                <p className="font-semibold">Wildlife Condition</p>
                <p className="mt-1 text-gray-300">Select the condition that best describes the wildlife at the time of reporting. This helps responders assess the urgency and determine the appropriate response.</p>
              </InfoPopover>
            </label>
            <select
              value={form.wildlifeCondition}
              onChange={update('wildlifeCondition')}
              className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500"
              required
            >
              <option value="">Select condition</option>
              <option value="Healthy">Healthy</option>
              <option value="Injured">Injured</option>
              <option value="Sick">Sick</option>
              <option value="Trapped">Trapped</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nearest Landmark <InfoPopover>
                <p className="font-semibold">Nearest Landmark</p>
                <p className="mt-1 text-gray-300">Providing a nearby landmark helps responders locate the reported wildlife more quickly and accurately, especially if GPS accuracy is limited.</p>
              </InfoPopover>
            </label>
            <input
              type="text"
              value={form.location}
              onChange={update('location')}
              className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500"
              placeholder="Near Barangay Hall, beside the elementary school."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              GPS Location <InfoPopover position="top">
                <p className="font-semibold">GPS Location</p>
                <p className="mt-1 text-gray-300">Your current GPS location is required to help responders accurately locate the reported wildlife. After retrieving your location, verify the marker on the map and adjust it if necessary before submitting your report.</p>
              </InfoPopover>
            </label>
            <div className="mt-1.5 space-y-3">
              <input type="hidden" name="latitude" value={form.latitude} required />
              <input type="hidden" name="longitude" value={form.longitude} required />
              <button
                type="button"
                onClick={getLocation}
                disabled={gettingLocation}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-600 transition hover:border-green-500 hover:text-green-600 disabled:opacity-50"
              >
                {gettingLocation ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
                ) : (
                  <span className="text-base">📍</span>
                )}
                {gettingLocation ? 'Getting location...' : 'Get Current Location'}
              </button>
              <div className="relative h-56 overflow-hidden rounded-lg border border-gray-200">
                <MapContainer
                  center={form.latitude && form.longitude ? [parseFloat(form.latitude), parseFloat(form.longitude)] : [9.967, 118.783]}
                  zoom={form.latitude && form.longitude ? 16 : 7}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker form={form} setForm={setForm} />
                  <MapCentered form={form} locateTrigger={locateTrigger} />
                </MapContainer>
                {!form.latitude && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="rounded-lg bg-white/90 px-3 py-1.5 text-sm text-gray-500 shadow-sm">
                      Click on the map to set location
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description <InfoPopover>
                <p className="font-semibold">Description</p>
                <p className="mt-1 text-gray-300">Provide a clear and detailed description of the incident. Include information such as the wildlife's behavior, condition, nearby hazards, or any other details that may assist responders in assessing and responding to the report.</p>
              </InfoPopover>
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={update('description')}
              className="mt-1.5 w-full resize-y rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500"
              placeholder="Briefly describe what happened, including the wildlife's condition, behavior, surroundings, or any important details."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Supporting Photos <InfoPopover>
                <p className="font-semibold">Supporting Photos</p>
                <p className="mt-1 text-gray-300">Upload at least one clear photo of the wildlife or incident. Photos help responders verify the report, identify the wildlife species, assess its condition, and determine the most appropriate response before dispatching personnel.</p>
              </InfoPopover>
            </label>
            <div className="mt-1.5">
              <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp" multiple capture="environment" onChange={handleImages} className="hidden" />
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
                  {imageFiles.length === 0 ? 'Add Photos' : 'Add More'}
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
