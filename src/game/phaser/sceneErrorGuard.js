import { GAME_EVENTS } from './events.js'

const GUARDED_METHODS = Object.freeze(['init', 'create', 'update'])

// O ErrorBoundary do React não vê o loop do Phaser: sem este guarda, uma exceção congela a tela.
// Depois da falha os métodos viram no-op para não reportar a cada quadro até o React desmontar o jogo.
export function guardScene(scene, sceneKey, emit) {
  let crashed = false
  for (const name of GUARDED_METHODS) {
    const original = scene[name]
    if (typeof original !== 'function') continue
    scene[name] = function guarded(...args) {
      if (crashed) return undefined
      try {
        return original.apply(this, args)
      } catch (error) {
        crashed = true
        emit(GAME_EVENTS.GAME_CRASHED, { error, sceneKey })
        return undefined
      }
    }
  }
}
