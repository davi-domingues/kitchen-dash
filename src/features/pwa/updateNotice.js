export const PLAY_PATH = '/jogar'

// O aviso nunca aparece na tela da partida (SYSTEM_DESIGN §8.4): recarregar ali perderia o turno
export function shouldShowUpdateNotice({ needRefresh, dismissed, pathname }) {
  const inPlay = pathname === PLAY_PATH || pathname.startsWith(`${PLAY_PATH}/`)
  return needRefresh && !dismissed && !inPlay
}
