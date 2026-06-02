/// <reference types="vite/client" />

/**
 * Only variables prefixed with VITE_ are exposed to browser code via import.meta.env.
 * Never add EMAIL_*, passwords, or API secrets here.
 */
interface ImportMetaEnv {
  readonly VITE_CONVEX_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
