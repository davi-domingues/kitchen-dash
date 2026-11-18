import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { contentPlugin } from './scripts/validate-content.js'

export default defineConfig({
  // contentPlugin barra o build se algum content/*.json violar o schema (KD-10)
  plugins: [contentPlugin(), react(), tailwindcss()],
  build: {
    // O chunk do Phaser (~1,2 MB) é esperado e só carrega em /jogar; o orçamento real fica no check-size
    chunkSizeWarningLimit: 1300,
  },
})
