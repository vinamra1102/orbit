import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Respect the port assigned by preview tooling via the PORT env var.
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    strictPort: false,
  },
})
