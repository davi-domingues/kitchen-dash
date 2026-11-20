import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { pwaOptions } from './scripts/pwaConfig.js'
import { contentPlugin } from './scripts/validate-content.js'

export default defineConfig({
  // contentPlugin barra o build se algum content/*.json violar o schema (KD-10)
  plugins: [contentPlugin(), react(), tailwindcss(), VitePWA(pwaOptions)],
  build: {
    // O chunk do Phaser (~1,2 MB) é esperado e só carrega em /jogar; o orçamento real fica no check-size
    chunkSizeWarningLimit: 1300,
  },
})
