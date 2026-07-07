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

  function toggleDay(index) {
    setShifts((prev) => prev.map((s, i) => (i === index ? { ...s, active: !s.active } : s)))
  }

  function toggleAllOn() {
    setShifts((prev) => prev.map((s) => ({ ...s, active: true })))
  }

  function toggleAllOff() {
    setShifts((prev) => prev.map((s) => ({ ...s, active: false })))
  }

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    try {
      const activeShifts = shifts.filter((s) => s.active)
      if (activeShifts.length === 0) {
        setMessage({ type: 'error', text: 'At least one day must be active.' })
        setSaving(false)
        return
      }
      await rescuerApi.saveShifts(shifts)
      setMessage({ type: 'success', text: 'Schedule saved successfully.' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  const today = new Date().getDay()
  const activeCount = shifts.filter((s) => s.active).length

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Shifts</h1>
            <p className="mt-1 text-base text-gray-500">
              {activeCount === 0
                ? 'You are currently off-duty'
                : `${activeCount} day${activeCount > 1 ? 's' : ''} on-call this week`
              }
            </p>
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

        <div className="mb-5 flex gap-2">
          <button onClick={toggleAllOn}
            className="rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:border-green-400 hover:text-green-700 transition-all"
          >
            Enable All
          </button>
          <button onClick={toggleAllOff}
            className="rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:border-red-400 hover:text-red-700 transition-all"
          >
            Disable All
          </button>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-36 animate-pulse rounded-2xl bg-gray-100 border-2 border-gray-200" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shifts.map((shift, i) => {
              const isToday = shift.dayOfWeek === today
              return (
                <div
                  key={shift.dayOfWeek}
                  className={`rounded-2xl border-2 bg-white p-5 transition-all ${
                    shift.active
                      ? 'border-green-300 hover:border-green-500 hover:shadow-md'
                      : 'border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100'
                  } ${isToday ? 'ring-2 ring-amber-400' : ''}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-base font-bold ${isToday ? 'text-amber-700' : 'text-gray-900'}`}>
                        {DAYS[shift.dayOfWeek]}
                      </span>
                      {isToday && (
                        <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          Today
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => toggleDay(i)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
                        shift.active ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-all ${
                        shift.active ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {shift.active ? (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-0.5">Start</label>
                        <input
                          type="time"
                          value={shift.startTime}
                          onChange={(e) => updateShift(i, 'startTime', e.target.value)}
                          className="w-full rounded-lg border-2 border-gray-200 px-2.5 py-1.5 text-sm font-semibold text-gray-800 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-0.5">End</label>
                        <input
                          type="time"
                          value={shift.endTime}
                          onChange={(e) => updateShift(i, 'endTime', e.target.value)}
                          className="w-full rounded-lg border-2 border-gray-200 px-2.5 py-1.5 text-sm font-semibold text-gray-800 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 transition-all"
                        />
                      </div>
                      <span className="inline-block rounded-full bg-green-100 px-3 py-0.5 text-xs font-bold text-green-800">
                        On Call
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[88px]">
                      <span className="text-sm font-semibold text-gray-400">Day Off</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
