import { useState, useEffect } from 'react'
import { rescuer as rescuerApi } from '../../services/api'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const DEFAULT_SHIFTS = DAYS.map((_, i) => ({
  dayOfWeek: i,
  startTime: '09:00',
  endTime: '17:00',
  active: i >= 1 && i <= 5,
}))

export default function RescuerShifts() {
  const [shifts, setShifts] = useState(DEFAULT_SHIFTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    rescuerApi.getShifts()
      .then((data) => {
        if (data.shifts?.length) {
          const merged = shifts.map((d) => {
            const saved = data.shifts.find((s) => s.dayOfWeek === d.dayOfWeek)
            return saved || d
          })
          setShifts(merged)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function updateShift(index, field, value) {
    setShifts((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)))
  }

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    try {
      await rescuerApi.saveShifts(shifts)
      setMessage({ type: 'success', text: 'Schedule saved.' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Shifts</h1>
            <p className="mt-1 text-lg text-gray-500">Set your on-call schedule</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-amber-600 px-6 py-3 text-base font-bold text-white hover:bg-amber-700 disabled:opacity-50 transition-all shadow"
          >
            {saving ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>

        {message && (
          <div className={`mb-6 rounded-xl border px-5 py-3.5 text-sm font-medium ${
            message.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}>{message.text}</div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {shifts.map((shift, i) => (
              <div key={i} className="rounded-xl border-2 border-gray-200 bg-white p-5 transition-all hover:border-amber-400">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-3 min-w-[160px]">
                    <input
                      type="checkbox"
                      checked={shift.active}
                      onChange={(e) => updateShift(i, 'active', e.target.checked)}
                      className="h-5 w-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-lg font-bold text-gray-900">{DAYS[shift.dayOfWeek]}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase">Start</label>
                      <input
                        type="time"
                        value={shift.startTime}
                        onChange={(e) => updateShift(i, 'startTime', e.target.value)}
                        className="mt-1 rounded-lg border-2 border-gray-300 px-3 py-2 text-base font-medium focus:border-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-100"
                      />
                    </div>
                    <span className="text-xl text-gray-400 mt-5">→</span>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase">End</label>
                      <input
                        type="time"
                        value={shift.endTime}
                        onChange={(e) => updateShift(i, 'endTime', e.target.value)}
                        className="mt-1 rounded-lg border-2 border-gray-300 px-3 py-2 text-base font-medium focus:border-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-100"
                      />
                    </div>
                  </div>
                  <span className={`ml-auto text-sm font-bold px-3 py-1 rounded-full ${
                    shift.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {shift.active ? 'On Call' : 'Off'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
