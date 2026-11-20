import { sentryVitePlugin } from '@sentry/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { sentryPluginOptions, sentryRelease } from './scripts/sentry-build.js'
import { contentPlugin } from './scripts/validate-content.js'

const sentry = sentryPluginOptions(process.env)
const release = sentryRelease(process.env)

export default defineConfig({
  // contentPlugin barra o build se algum content/*.json violar o schema (KD-10)
  plugins: [contentPlugin(), react(), tailwindcss(), ...(sentry ? [sentryVitePlugin(sentry)] : [])],
  // O app reporta a mesma release usada no upload dos mapas (services/monitoring.js)
  define: release ? { 'import.meta.env.VITE_SENTRY_RELEASE': JSON.stringify(release) } : {},
  build: {
    // 'hidden' gera os mapas sem referenciá-los no JS; só existem quando há upload, que os apaga depois
    sourcemap: sentry ? 'hidden' : false,
    // O chunk do Phaser (~1,2 MB) é esperado e só carrega em /jogar; o orçamento real fica no check-size
    chunkSizeWarningLimit: 1300,
  },
})
