import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/GPSGhotelaria/' : '/',
  plugins: [react()],
  server: { port: 3000 },
  preview: { port: 3000 },
}))
