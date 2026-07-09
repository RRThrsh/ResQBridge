import { useState, useEffect } from 'react'
import { admin as adminApi } from '../../services/api'

const UPLOAD_URL = '/api/v1/admin/upload'

export default function EditConfig({ section }) {
  const [config, setConfig] = useState(null)
  const [defaults, setDefaults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [dirty, setDirty] = useState(false)
  const [uploading, setUploading] = useState(null) // { index, progress } or null

  function ensureSections(cfg) {
    if (!cfg) return cfg
    const sections = {
      howItWorks: { title: '', subtitle: '', steps: [] },
      successStories: { title: '', subtitle: '', stories: [] },
      gallery: { title: '', subtitle: '', images: [] },
      volunteer: { title: '', subtitle: '', roles: [], requirements: [], cta: { label: '', link: '' } },
      partners: { title: '', subtitle: '', partners: [] },
    }
    const nested = {
      contact: { social: { facebook: '', instagram: '', twitter: '' } },
    }
    for (const [key, defaults] of Object.entries(sections)) {
      if (!cfg[key]) { cfg[key] = defaults; continue }
      for (const [nestedKey, nestedVal] of Object.entries(defaults)) {
        if (cfg[key][nestedKey] === undefined) cfg[key][nestedKey] = nestedVal
      }
    }
    for (const [key, defaults] of Object.entries(nested)) {
      if (!cfg[key]) { cfg[key] = defaults; continue }
      for (const [nestedKey, nestedVal] of Object.entries(defaults)) {
        if (cfg[key][nestedKey] === undefined) cfg[key][nestedKey] = nestedVal
        else if (typeof nestedVal === 'object' && !Array.isArray(nestedVal)) {
          for (const [deepKey, deepVal] of Object.entries(nestedVal)) {
            if (cfg[key][nestedKey][deepKey] === undefined) cfg[key][nestedKey][deepKey] = deepVal
          }
        }
      }
    }
    return cfg
  }

  async function fetchConfig() {
    try {
      setLoading(true)
      const data = await adminApi.getLandingConfig()
      setConfig(ensureSections(data.config))
      setDefaults(ensureSections(data.defaults))
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchConfig() }, [])

  function update(path, value) {
    setConfig((prev) => {
      const copy = structuredClone(prev)
      const keys = path.split('.')
      let obj = copy
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {}
        obj = obj[keys[i]]
      }
      obj[keys[keys.length - 1]] = value
      return copy
    })
    setDirty(true)
  }

  function updateFAQ(index, field, value) {
    setConfig((prev) => {
      const copy = structuredClone(prev)
      copy.faq[index][field] = value
      return copy
    })
    setDirty(true)
  }

  function addFAQ() {
    setConfig((prev) => {
      const copy = structuredClone(prev)
      copy.faq.push({ q: '', a: '' })
      return copy
    })
    setDirty(true)
  }

  function removeFAQ(index) {
    setConfig((prev) => {
      const copy = structuredClone(prev)
      copy.faq.splice(index, 1)
      return copy
    })
    setDirty(true)
  }

  function updateCarouselSlide(index, field, value) {
    setConfig((prev) => {
      const copy = structuredClone(prev)
      copy.carousel[index][field] = value
      return copy
    })
    setDirty(true)
  }

  function addCarouselSlide() {
    setConfig((prev) => {
      const copy = structuredClone(prev)
      copy.carousel.push({ title: '', desc: '', image: '' })
      return copy
    })
    setDirty(true)
  }

  function removeCarouselSlide(index) {
    setConfig((prev) => {
      const copy = structuredClone(prev)
      copy.carousel.splice(index, 1)
      return copy
    })
    setDirty(true)
  }

  function addHowItWorksStep() {
    setConfig((prev) => {
      const c = structuredClone(prev)
      if (!c.howItWorks) c.howItWorks = { title: '', subtitle: '', steps: [] }
      if (!c.howItWorks.steps) c.howItWorks.steps = []
      c.howItWorks.steps.push({ title: '', desc: '', icon: '' })
      return c
    })
    setDirty(true)
  }

  function removeHowItWorksStep(index) {
    setConfig((prev) => {
      const c = structuredClone(prev)
      c.howItWorks.steps.splice(index, 1)
      return c
    })
    setDirty(true)
  }

  function addSuccessStory() {
    setConfig((prev) => {
      const c = structuredClone(prev)
      if (!c.successStories) c.successStories = { title: '', subtitle: '', stories: [] }
      if (!c.successStories.stories) c.successStories.stories = []
      c.successStories.stories.push({ species: '', quote: '', result: '', fullStory: '', name: '', role: '' })
      return c
    })
    setDirty(true)
  }

  function removeSuccessStory(index) {
    setConfig((prev) => {
      const c = structuredClone(prev)
      c.successStories.stories.splice(index, 1)
      return c
    })
    setDirty(true)
  }

  function addGalleryImage() {
    setConfig((prev) => {
      const c = structuredClone(prev)
      if (!c.gallery) c.gallery = { title: '', subtitle: '', images: [] }
      if (!c.gallery.images) c.gallery.images = []
      c.gallery.images.push({ title: '', label: '', desc: '', date: '', image: '' })
      return c
    })
    setDirty(true)
  }

  function removeGalleryImage(index) {
    setConfig((prev) => {
      const c = structuredClone(prev)
      c.gallery.images.splice(index, 1)
      return c
    })
    setDirty(true)
  }

  function handleGalleryImageUpload(index, file) {
    const formData = new FormData()
    formData.append('image', file)
    const xhr = new XMLHttpRequest()
    setUploading({ section: 'gallery', index, progress: 0 })
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100)
        setUploading({ section: 'gallery', index, progress: pct })
      }
    }
    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText)
        setConfig((prev) => {
          const c = structuredClone(prev)
          if (c.gallery?.images?.[index]) c.gallery.images[index].image = data.url
          return c
        })
        setDirty(true)
      } else {
        try { const d = JSON.parse(xhr.responseText); alert(d.message) } catch { alert('Upload failed') }
      }
      setUploading(null)
    }
    xhr.onerror = () => { alert('Upload failed'); setUploading(null) }
    xhr.open('POST', UPLOAD_URL)
    xhr.withCredentials = true
    xhr.send(formData)
  }

  function addVolunteerRole() {
    setConfig((prev) => {
      const c = structuredClone(prev)
      if (!c.volunteer) c.volunteer = { title: '', subtitle: '', roles: [], requirements: [], cta: { label: '', link: '' } }
      if (!c.volunteer.roles) c.volunteer.roles = []
      c.volunteer.roles.push({ title: '', desc: '' })
      return c
    })
    setDirty(true)
  }

  function removeVolunteerRole(index) {
    setConfig((prev) => {
      const c = structuredClone(prev)
      c.volunteer.roles.splice(index, 1)
      return c
    })
    setDirty(true)
  }

  function addVolunteerRequirement() {
    setConfig((prev) => {
      const c = structuredClone(prev)
      if (!c.volunteer) c.volunteer = { title: '', subtitle: '', roles: [], requirements: [], cta: { label: '', link: '' } }
      if (!c.volunteer.requirements) c.volunteer.requirements = []
      c.volunteer.requirements.push('')
      return c
    })
    setDirty(true)
  }

  function removeVolunteerRequirement(index) {
    setConfig((prev) => {
      const c = structuredClone(prev)
      c.volunteer.requirements.splice(index, 1)
      return c
    })
    setDirty(true)
  }

  function addPartner() {
    setConfig((prev) => {
      const c = structuredClone(prev)
      if (!c.partners) c.partners = { title: '', subtitle: '', partners: [] }
      if (!c.partners.partners) c.partners.partners = []
      c.partners.partners.push({ name: '', type: '' })
      return c
    })
    setDirty(true)
  }

  function removePartner(index) {
    setConfig((prev) => {
      const c = structuredClone(prev)
      c.partners.partners.splice(index, 1)
      return c
    })
    setDirty(true)
  }

  function handleCarouselImageUpload(index, file) {
    const formData = new FormData()
    formData.append('image', file)
    const xhr = new XMLHttpRequest()
    setUploading({ index, progress: 0 })
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100)
        setUploading({ index, progress: pct })
      }
    }
    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText)
        updateCarouselSlide(index, 'image', data.url)
      } else {
        try { const d = JSON.parse(xhr.responseText); alert(d.message) } catch { alert('Upload failed') }
      }
      setUploading(null)
    }
    xhr.onerror = () => { alert('Upload failed'); setUploading(null) }
    xhr.open('POST', UPLOAD_URL)
    xhr.withCredentials = true
    xhr.send(formData)
  }

  function updateNewsItem(index, field, value) {
    setConfig((prev) => {
      const copy = structuredClone(prev)
      copy.newsEvents.news[index][field] = value
      return copy
    })
    setDirty(true)
  }

  function addNewsItem() {
    setConfig((prev) => {
      const copy = structuredClone(prev)
      copy.newsEvents.news.push({ date: '', title: '', category: '', desc: '' })
      return copy
    })
    setDirty(true)
  }

  function removeNewsItem(index) {
    setConfig((prev) => {
      const copy = structuredClone(prev)
      copy.newsEvents.news.splice(index, 1)
      return copy
    })
    setDirty(true)
  }

  function updateEvent(index, field, value) {
    setConfig((prev) => {
      const copy = structuredClone(prev)
      copy.newsEvents.events[index][field] = value
      return copy
    })
    setDirty(true)
  }

  function addEvent() {
    setConfig((prev) => {
      const copy = structuredClone(prev)
      copy.newsEvents.events.push({ date: '', title: '', location: '', desc: '' })
      return copy
    })
    setDirty(true)
  }

  function removeEvent(index) {
    setConfig((prev) => {
      const copy = structuredClone(prev)
      copy.newsEvents.events.splice(index, 1)
      return copy
    })
    setDirty(true)
  }

  async function handleSave() {
    try {
      setSaving(true)
      setMessage(null)
      await adminApi.updateLandingConfig(config)
      setMessage({ type: 'success', text: 'Landing page content saved.' })
      setDirty(false)
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  async function handleReset() {
    setConfig(structuredClone(defaults))
    setDirty(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      </div>
    )
  }

  if (!config) {
    return <p className="py-10 text-center text-sm text-gray-400">Failed to load config.</p>
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{section ? `${section.charAt(0).toUpperCase() + section.slice(1)} Section` : 'Edit Config'}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {section ? `Edit the ${section} content.` : 'Edit the content displayed on the landing page sections.'}
          </p>
        </div>
        {section && (
        <div className="flex items-center gap-3">
          <button onClick={handleReset} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        )}
      </div>

      {message && (
        <div className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
          message.type === 'success'
            ? 'border-green-200 bg-green-50 text-green-700'
            : 'border-red-200 bg-red-50 text-red-700'
        }`}>{message.text}</div>
      )}

      {!section ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white py-20">
          <svg className="mb-4 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-700">Select a Section</h3>
          <p className="mt-1 text-sm text-gray-400">Choose a section from the sidebar to edit.</p>
        </div>
      ) : (
      <div className="space-y-8">
        {section === 'hero' && <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Hero Section</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Badge</label>
              <input
                value={config.hero.badge}
                onChange={(e) => update('hero.badge', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                value={config.hero.title}
                onChange={(e) => update('hero.title', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={3}
                value={config.hero.description}
                onChange={(e) => update('hero.description', e.target.value)}
                className="mt-1 w-full resize-y rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>
        </section>}

        {section === 'contact' && <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Contact Info</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Emergency Hotline</label>
              <input
                value={config.contact.emergencyHotline}
                onChange={(e) => update('contact.emergencyHotline', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                value={config.contact.phone}
                onChange={(e) => update('contact.phone', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                value={config.contact.email}
                onChange={(e) => update('contact.email', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                value={config.contact.address}
                onChange={(e) => update('contact.address', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Operating Hours</label>
              <input
                value={config.contact.hours}
                onChange={(e) => update('contact.hours', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div className="sm:col-span-2">
              <p className="mb-2 text-sm font-medium text-gray-700">Social Media Links</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs text-gray-500">Facebook</label>
                  <input value={config.contact?.social?.facebook || ''} onChange={(e) => update('contact.social.facebook', e.target.value)} placeholder="https://facebook.com/..." className="mt-0.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Instagram</label>
                  <input value={config.contact?.social?.instagram || ''} onChange={(e) => update('contact.social.instagram', e.target.value)} placeholder="https://instagram.com/..." className="mt-0.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Twitter</label>
                  <input value={config.contact?.social?.twitter || ''} onChange={(e) => update('contact.social.twitter', e.target.value)} placeholder="https://twitter.com/..." className="mt-0.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500" />
                </div>
              </div>
            </div>
          </div>
        </section>}

        {section === 'faq' && <section className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">FAQ</h2>
            <button onClick={addFAQ} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
              + Add FAQ
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {config.faq.map((item, i) => (
              <div key={i} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-3">
                    <input
                      value={item.q}
                      onChange={(e) => updateFAQ(i, 'q', e.target.value)}
                      placeholder="Question"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    />
                    <textarea
                      rows={2}
                      value={item.a}
                      onChange={(e) => updateFAQ(i, 'a', e.target.value)}
                      placeholder="Answer"
                      className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                  <button
                    onClick={() => removeFAQ(i)}
                    className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>}

        {section === 'carousel' && <section className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Carousel Slides</h2>
            <button onClick={addCarouselSlide} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
              + Add Slide
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {config.carousel.map((slide, i) => (
              <div key={i} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-3">
                    <input
                      value={slide.title}
                      onChange={(e) => updateCarouselSlide(i, 'title', e.target.value)}
                      placeholder="Slide title"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    />
                    <textarea
                      rows={2}
                      value={slide.desc}
                      onChange={(e) => updateCarouselSlide(i, 'desc', e.target.value)}
                      placeholder="Slide description"
                      className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    />
                    <div className="flex items-center gap-3">
                      {uploading?.index === i ? (
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-200">
                            <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${uploading.progress}%` }} />
                          </div>
                          <span className="text-[10px] text-gray-500">{uploading.progress}%</span>
                        </div>
                      ) : slide.image ? (
                        <div className="relative h-14 w-24 overflow-hidden rounded-lg border border-gray-200">
                          <img src={slide.image} alt="" className="h-full w-full object-cover" />
                          <button
                            onClick={() => updateCarouselSlide(i, 'image', '')}
                            className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white"
                          >×</button>
                        </div>
                      ) : (
                        <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-500 transition-colors hover:bg-gray-50">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Add Image
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCarouselImageUpload(i, f); e.target.value = '' }} />
                        </label>
                      )}
                      <span className="text-[10px] text-gray-400">Max 1920px, compressed</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeCarouselSlide(i)}
                    className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>}

        {section === 'howItWorks' && <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">How It Works</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                value={config.howItWorks?.title || ''}
                onChange={(e) => update('howItWorks.title', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subtitle</label>
              <textarea
                rows={2}
                value={config.howItWorks?.subtitle || ''}
                onChange={(e) => update('howItWorks.subtitle', e.target.value)}
                className="mt-1 w-full resize-y rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Steps</h3>
              <button onClick={addHowItWorksStep} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                + Add Step
              </button>
            </div>
            <div className="mt-3 space-y-4">
              {(config.howItWorks?.steps || []).map((step, i) => (
                <div key={i} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-700 text-xs font-bold text-white">{i + 1}</span>
                      <p className="text-sm font-medium text-gray-900">Step {i + 1}</p>
                    </div>
                    <button
                      onClick={() => removeHowItWorksStep(i)}
                      className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-3 space-y-3">
                    <input
                      value={step.title}
                      onChange={(e) => {
                        setConfig((prev) => { const c = structuredClone(prev); c.howItWorks.steps[i].title = e.target.value; return c })
                        setDirty(true)
                      }}
                      placeholder="Title"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    />
                    <textarea
                      rows={2}
                      value={step.desc}
                      onChange={(e) => {
                        setConfig((prev) => { const c = structuredClone(prev); c.howItWorks.steps[i].desc = e.target.value; return c })
                        setDirty(true)
                      }}
                      placeholder="Description"
                      className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    />
                    <input
                      value={step.icon}
                      onChange={(e) => {
                        setConfig((prev) => { const c = structuredClone(prev); c.howItWorks.steps[i].icon = e.target.value; return c })
                        setDirty(true)
                      }}
                      placeholder="SVG path (stroke d attribute)"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono text-xs outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>}

        {section === 'successStories' && <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Success Stories</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                value={config.successStories?.title || ''}
                onChange={(e) => update('successStories.title', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subtitle</label>
              <textarea
                rows={2}
                value={config.successStories?.subtitle || ''}
                onChange={(e) => update('successStories.subtitle', e.target.value)}
                className="mt-1 w-full resize-y rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Stories</h3>
              <button onClick={addSuccessStory} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                + Add Story
              </button>
            </div>
            <div className="mt-3 space-y-4">
              {(config.successStories?.stories || []).map((story, i) => (
                <div key={i} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Story {i + 1}</p>
                    <button
                      onClick={() => removeSuccessStory(i)}
                      className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      value={story.species}
                      onChange={(e) => { setConfig((prev) => { const c = structuredClone(prev); c.successStories.stories[i].species = e.target.value; return c }); setDirty(true) }}
                      placeholder="Species"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    />
                    <input
                      value={story.name}
                      onChange={(e) => { setConfig((prev) => { const c = structuredClone(prev); c.successStories.stories[i].name = e.target.value; return c }); setDirty(true) }}
                      placeholder="Author name"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    />
                    <input
                      value={story.role}
                      onChange={(e) => { setConfig((prev) => { const c = structuredClone(prev); c.successStories.stories[i].role = e.target.value; return c }); setDirty(true) }}
                      placeholder="Author role"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    />
                    <input
                      value={story.quote}
                      onChange={(e) => { setConfig((prev) => { const c = structuredClone(prev); c.successStories.stories[i].quote = e.target.value; return c }); setDirty(true) }}
                      placeholder="Quote"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                  <div className="mt-3 space-y-3">
                    <textarea
                      rows={2}
                      value={story.result}
                      onChange={(e) => { setConfig((prev) => { const c = structuredClone(prev); c.successStories.stories[i].result = e.target.value; return c }); setDirty(true) }}
                      placeholder="Short result summary"
                      className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    />
                    <textarea
                      rows={3}
                      value={story.fullStory}
                      onChange={(e) => { setConfig((prev) => { const c = structuredClone(prev); c.successStories.stories[i].fullStory = e.target.value; return c }); setDirty(true) }}
                      placeholder="Full story (shown in modal)"
                      className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>}

        {section === 'gallery' && <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Gallery</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                value={config.gallery?.title || ''}
                onChange={(e) => update('gallery.title', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subtitle</label>
              <textarea
                rows={2}
                value={config.gallery?.subtitle || ''}
                onChange={(e) => update('gallery.subtitle', e.target.value)}
                className="mt-1 w-full resize-y rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Images</h3>
              <button onClick={addGalleryImage} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                + Add Image
              </button>
            </div>
            <div className="mt-3 space-y-4">
              {(config.gallery?.images || []).map((img, i) => (
                <div key={i} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Image {i + 1}</p>
                    <button
                      onClick={() => removeGalleryImage(i)}
                      className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      value={img.title}
                      onChange={(e) => { setConfig((prev) => { const c = structuredClone(prev); c.gallery.images[i].title = e.target.value; return c }); setDirty(true) }}
                      placeholder="Title"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    />
                    <input
                      value={img.label}
                      onChange={(e) => { setConfig((prev) => { const c = structuredClone(prev); c.gallery.images[i].label = e.target.value; return c }); setDirty(true) }}
                      placeholder="Label (e.g. Rescue Mission)"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    />
                    <input
                      value={img.date}
                      onChange={(e) => { setConfig((prev) => { const c = structuredClone(prev); c.gallery.images[i].date = e.target.value; return c }); setDirty(true) }}
                      placeholder="Date"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={img.desc}
                    onChange={(e) => { setConfig((prev) => { const c = structuredClone(prev); c.gallery.images[i].desc = e.target.value; return c }); setDirty(true) }}
                    placeholder="Description"
                    className="mt-3 w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                  <div className="mt-3 flex items-center gap-3">
                    {uploading?.section === 'gallery' && uploading?.index === i ? (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-200">
                          <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${uploading.progress}%` }} />
                        </div>
                        <span className="text-[10px] text-gray-500">{uploading.progress}%</span>
                      </div>
                    ) : img.image ? (
                      <div className="relative h-14 w-24 overflow-hidden rounded-lg border border-gray-200">
                        <img src={img.image} alt="" className="h-full w-full object-cover" />
                        <button
                          onClick={() => {
                            setConfig((prev) => { const c = structuredClone(prev); if (c.gallery?.images?.[i]) c.gallery.images[i].image = ''; return c })
                            setDirty(true)
                          }}
                          className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white"
                        >×</button>
                      </div>
                    ) : (
                      <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-500 transition-colors hover:bg-gray-50">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Upload Image
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleGalleryImageUpload(i, f); e.target.value = '' }} />
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>}

        {section === 'volunteer' && <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Volunteer Section</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                value={config.volunteer?.title || ''}
                onChange={(e) => update('volunteer.title', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subtitle</label>
              <textarea
                rows={2}
                value={config.volunteer?.subtitle || ''}
                onChange={(e) => update('volunteer.subtitle', e.target.value)}
                className="mt-1 w-full resize-y rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Roles</h3>
              <button onClick={addVolunteerRole} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                + Add Role
              </button>
            </div>
            <div className="mt-3 space-y-4">
              {(config.volunteer?.roles || []).map((role, i) => (
                <div key={i} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Role {i + 1}</p>
                    <button
                      onClick={() => removeVolunteerRole(i)}
                      className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <input
                    value={role.title}
                    onChange={(e) => { setConfig((prev) => { const c = structuredClone(prev); c.volunteer.roles[i].title = e.target.value; return c }); setDirty(true) }}
                    placeholder="Role title"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                  <textarea
                    rows={2}
                    value={role.desc}
                    onChange={(e) => { setConfig((prev) => { const c = structuredClone(prev); c.volunteer.roles[i].desc = e.target.value; return c }); setDirty(true) }}
                    placeholder="Role description"
                    className="mt-3 w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Requirements</h3>
              <button onClick={addVolunteerRequirement} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                + Add Requirement
              </button>
            </div>
            <div className="mt-3 space-y-3">
              {(config.volunteer?.requirements || []).map((req, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={req}
                    onChange={(e) => {
                      setConfig((prev) => { const c = structuredClone(prev); c.volunteer.requirements[i] = e.target.value; return c })
                      setDirty(true)
                    }}
                    placeholder={`Requirement ${i + 1}`}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                  <button
                    onClick={() => removeVolunteerRequirement(i)}
                    className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-900">CTA Button</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input
                value={config.volunteer?.cta?.label || ''}
                onChange={(e) => update('volunteer.cta.label', e.target.value)}
                placeholder="Button label"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
              <input
                value={config.volunteer?.cta?.link || ''}
                onChange={(e) => update('volunteer.cta.link', e.target.value)}
                placeholder="Button link"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>
        </section>}

        {section === 'partners' && <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Partners</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                value={config.partners?.title || ''}
                onChange={(e) => update('partners.title', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subtitle</label>
              <textarea
                rows={2}
                value={config.partners?.subtitle || ''}
                onChange={(e) => update('partners.subtitle', e.target.value)}
                className="mt-1 w-full resize-y rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Partner Organizations</h3>
              <button onClick={addPartner} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                + Add Partner
              </button>
            </div>
            <div className="mt-3 space-y-4">
              {(config.partners?.partners || []).map((partner, i) => (
                <div key={i} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Partner {i + 1}</p>
                    <button
                      onClick={() => removePartner(i)}
                      className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      value={partner.name}
                      onChange={(e) => { setConfig((prev) => { const c = structuredClone(prev); c.partners.partners[i].name = e.target.value; return c }); setDirty(true) }}
                      placeholder="Organization name"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    />
                    <input
                      value={partner.type}
                      onChange={(e) => { setConfig((prev) => { const c = structuredClone(prev); c.partners.partners[i].type = e.target.value; return c }); setDirty(true) }}
                      placeholder="Type (e.g. Government Agency)"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>}

        {section === 'location' && <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Location</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                value={config.location.title}
                onChange={(e) => update('location.title', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subtitle</label>
              <textarea
                rows={2}
                value={config.location.subtitle}
                onChange={(e) => update('location.subtitle', e.target.value)}
                className="mt-1 w-full resize-y rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Center Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={config.location.center.lat}
                  onChange={(e) => { setConfig((prev) => { const c = structuredClone(prev); c.location.center.lat = parseFloat(e.target.value) || 0; return c }); setDirty(true) }}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Center Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={config.location.center.lng}
                  onChange={(e) => { setConfig((prev) => { const c = structuredClone(prev); c.location.center.lng = parseFloat(e.target.value) || 0; return c }); setDirty(true) }}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
        </section>}

        {section === 'newsEvents' && <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">News &amp; Events</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                value={config.newsEvents.title}
                onChange={(e) => update('newsEvents.title', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subtitle</label>
              <textarea
                rows={2}
                value={config.newsEvents.subtitle}
                onChange={(e) => update('newsEvents.subtitle', e.target.value)}
                className="mt-1 w-full resize-y rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">News Items</h3>
              <button onClick={addNewsItem} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                + Add News
              </button>
            </div>
            <div className="mt-3 space-y-4">
              {config.newsEvents.news.map((item, i) => (
                <div key={i} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <input
                          value={item.date}
                          onChange={(e) => updateNewsItem(i, 'date', e.target.value)}
                          placeholder="Date"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                        />
                        <input
                          value={item.category}
                          onChange={(e) => updateNewsItem(i, 'category', e.target.value)}
                          placeholder="Category"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                        />
                        <input
                          value={item.title}
                          onChange={(e) => updateNewsItem(i, 'title', e.target.value)}
                          placeholder="Title"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={item.desc}
                        onChange={(e) => updateNewsItem(i, 'desc', e.target.value)}
                        placeholder="Description"
                        className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                    <button
                      onClick={() => removeNewsItem(i)}
                      className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Events</h3>
              <button onClick={addEvent} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                + Add Event
              </button>
            </div>
            <div className="mt-3 space-y-4">
              {config.newsEvents.events.map((ev, i) => (
                <div key={i} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <input
                          value={ev.date}
                          onChange={(e) => updateEvent(i, 'date', e.target.value)}
                          placeholder="Date"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                        />
                        <input
                          value={ev.title}
                          onChange={(e) => updateEvent(i, 'title', e.target.value)}
                          placeholder="Title"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                        />
                        <input
                          value={ev.location}
                          onChange={(e) => updateEvent(i, 'location', e.target.value)}
                          placeholder="Location"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={ev.desc}
                        onChange={(e) => updateEvent(i, 'desc', e.target.value)}
                        placeholder="Description"
                        className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                    <button
                      onClick={() => removeEvent(i)}
                      className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>}
      </div>
      )}
    </div>
  )
}
