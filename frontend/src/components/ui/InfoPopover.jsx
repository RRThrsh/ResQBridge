import { useState, useRef, useEffect } from 'react'

export default function InfoPopover({ children, className = '' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    let ignoreNext = true
    function handler(e) {
      if (e.key === 'Escape') { setOpen(false); return }
      if (ignoreNext) { ignoreNext = false; return }
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('keydown', handler)
    document.addEventListener('click', handler)
    return () => { document.removeEventListener('keydown', handler); document.removeEventListener('click', handler) }
  }, [open])

  return (
    <span ref={ref} className={`relative inline-flex align-middle ${className}`}>
      <button type="button" onClick={() => setOpen(!open)} className="text-gray-400 hover:text-gray-600" tabIndex={-1}>
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" /></svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-10 mt-1 w-72 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg">{children}</div>
      )}
    </span>
  )
}
