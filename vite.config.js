import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy API requests to a mock endpoint during development
      '/api/historical': {
        target: 'http://localhost:5174',
        changeOrigin: true,
        rewrite: (path) => '/mock-api/historical.json'
      }
    }
  }
})
