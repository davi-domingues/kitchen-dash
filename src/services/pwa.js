// Isola o vite-plugin-pwa: trocar o mecanismo de service worker não mexe em features/
export async function registerServiceWorker({ onNeedRefresh }) {
  // Em dev o SW cachearia o servidor do Vite; só registra no build de produção
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return null
  const { registerSW } = await import('virtual:pwa-register')
  return registerSW({ onNeedRefresh })
}
