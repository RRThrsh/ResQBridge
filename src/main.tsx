import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import './index.css'
import App from './App.tsx'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ConvexProvider client={convex}>
        <App />
      </ConvexProvider>
    </ThemeProvider>
  </StrictMode>,
)
