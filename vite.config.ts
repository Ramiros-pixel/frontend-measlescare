
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
feature/measleswatch-frontend
  css: {
    postcss: {
      plugins: [],
    },
  },


  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },

  server: {
    proxy: {
      '/be-api': {
        target: process.env.VITE_PROXY_TARGET || 'http://127.0.0.1:8000',
        changeOrigin: true,

        // /be-api/kiosk/identify-rfid
        // menjadi /api/kiosk/identify-rfid
        rewrite: (path) => path.replace(/^\/be-api/, '/api'),
      },
    },
  },
})
