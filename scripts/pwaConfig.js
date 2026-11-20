// Opções do vite-plugin-pwa (KD-41, SYSTEM_DESIGN §8.4) isoladas para serem testáveis

// Dados, login e telemetria nunca podem vir do cache: offline essas chamadas falham e a outbox assume
export const NETWORK_ONLY_HOSTS = [
  /^https:\/\/[^/]+\.supabase\.co\//,
  /^https:\/\/[^/]+\.sentry\.io\//,
  /^https:\/\/challenges\.cloudflare\.com\//,
]

export const PRECACHE_PATTERNS = ['**/*.{js,css,html,svg,png,webp,jpg,ogg,mp3,wav,json,woff2}']

export const pwaOptions = {
  // 'prompt': a versão nova espera o jogador pedir, nunca troca no meio de uma partida
  registerType: 'prompt',
  // O registro é feito em services/pwa.js; script inline violaria a CSP
  injectRegister: false,
  includeAssets: ['icon.svg'],
  manifest: {
    name: 'Kitchen Dash',
    short_name: 'Kitchen Dash',
    description: 'Jogo arcade de culinária num bistrô parisiense.',
    lang: 'pt-BR',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    theme_color: '#7f1d1d',
    background_color: '#1c1917',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
  },
  workbox: {
    globPatterns: PRECACHE_PATTERNS,
    // O chunk do Phaser passa do limite padrão de 2 MiB do Workbox e precisa estar no precache
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
    navigateFallback: 'index.html',
    cleanupOutdatedCaches: true,
    runtimeCaching: NETWORK_ONLY_HOSTS.map((urlPattern) => ({ urlPattern, handler: 'NetworkOnly' })),
  },
}
