import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // O chunk do Phaser (~1,2 MB) é esperado e só carrega em /jogar; o orçamento real fica no check-size
    chunkSizeWarningLimit: 1300,
  },
})
