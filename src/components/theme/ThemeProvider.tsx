import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ReactNode } from 'react'

const STORAGE_KEY = 'pwrrc-theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey={STORAGE_KEY}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
