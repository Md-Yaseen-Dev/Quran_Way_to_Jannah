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
    allowedHosts: ['6af4848c-a3d5-4652-92e2-826a1f544e58-00-2w1t7nmf8st86.sisko.replit.dev'],
  }
})
