import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          const normalized = id.replace(/\\/g, '/');
          if (normalized.includes('/node_modules/')) {
            if (
              normalized.includes('/node_modules/react/') ||
              normalized.includes('/node_modules/react-dom/') ||
              normalized.includes('/node_modules/react-router/') ||
              normalized.includes('/node_modules/react-router-dom/')
            ) {
              return 'react-vendor';
            }
            if (
              normalized.includes('/node_modules/framer-motion/') ||
              normalized.includes('/node_modules/lucide-react/')
            ) {
              return 'ui-vendor';
            }
            if (
              normalized.includes('/node_modules/@tanstack/') ||
              normalized.includes('/node_modules/axios/') ||
              normalized.includes('/node_modules/react-hot-toast/') ||
              normalized.includes('/node_modules/zustand/')
            ) {
              return 'query-vendor';
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
