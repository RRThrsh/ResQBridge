import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { en, fil, defaultLang, type Language } from '@/lib/i18n/translations'

type Dict = Record<string, string>

const dicts: Record<Language, Dict> = { en, fil }

interface LanguageContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: string, fallback?: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem('pwrrc_lang')
      if (stored === 'en' || stored === 'fil') return stored
    } catch { /* ignore */ }
    return defaultLang
  })

  const handleSetLang = useCallback((next: Language) => {
    setLang(next)
    try {
      localStorage.setItem('pwrrc_lang', next)
    } catch { /* ignore */ }
}, [])

  const t = useCallback(
    (key: string, fallback?: string): string => {
      return dicts[lang]?.[key] ?? dicts.en?.[key] ?? fallback ?? key
    },
    [lang],
  )

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}
