import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { apiPlugin } from './vite-api-plugin'
import {
  assertClientEnvHasNoSecrets,
  pickServerEmailEnv,
  pickServerOtpEnv,
} from './src/lib/server-email-env'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const clientEnv = loadEnv(mode, process.cwd(), 'VITE_')
  assertClientEnvHasNoSecrets(clientEnv)

  // Full load is Node-only (vite.config + dev middleware). Never reference these in src/.
  const serverEnv = loadEnv(mode, process.cwd(), '')
  const emailEnv = pickServerEmailEnv(serverEnv)
  const otpEnv = pickServerOtpEnv(serverEnv)

  return {
    envPrefix: 'VITE_',
    plugins: [react(), tailwindcss(), apiPlugin({ emailEnv, otpEnv })],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
