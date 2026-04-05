import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: process.env.VITE_ENGINE_URL || 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, ''),
      },
      '/ai': {
        target: process.env.VITE_AI_URL || 'http://localhost:8001',
        changeOrigin: true,
      },
      '/insights': {
        target: process.env.VITE_INSIGHTS_URL || 'http://localhost:8002',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/insights/, ''),
      },
      '/iam': {
        target: process.env.VITE_IAM_URL || 'http://localhost:8003',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/iam/, ''),
      },
    },
  },
})
