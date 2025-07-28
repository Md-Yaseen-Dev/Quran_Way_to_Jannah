import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  root: './client', // 👈 Set root to 'client'
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client/src'),
    },
  },
  publicDir: 'public', 
  build: {
    outDir: '../dist',     
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    port: 5173,
    open: true,
    allowedHosts: ["2d315b81-ce54-4b21-a440-d901001bf910-00-2k2ythpjl35tg.sisko.replit.dev"],
  }
})
