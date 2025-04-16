import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',  // Para subdomínio root ou './' para subdiretório
  css: {
    postcss: './postcss.config.cjs'
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
      supported: { 
        'top-level-await': true 
      }
    }
  }
})


