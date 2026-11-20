import { GAME_EVENTS } from '../../game/phaser/events.js'

// Ponte do débito #90: o Phaser só emite; quem fala com o monitoramento é o React (AGENTS.md §4)
export function subscribeGameCrash(bus, { report, onCrash }) {
  const handle = ({ error, sceneKey } = {}) => {
    report(error, { sceneKey })
    onCrash()
  }
  bus.on(GAME_EVENTS.GAME_CRASHED, handle)
  return () => bus.off(GAME_EVENTS.GAME_CRASHED, handle)
}
