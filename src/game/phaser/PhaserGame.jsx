import Phaser from 'phaser'
import { useEffect, useRef } from 'react'
import { BootScene } from './scenes/BootScene.js'
import { KitchenScene } from './scenes/KitchenScene.js'

const GAME_WIDTH = 960
const GAME_HEIGHT = 540

export default function PhaserGame() {
  const containerRef = useRef(null)

  useEffect(() => {
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      backgroundColor: '#2b1d1a',
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene: [BootScene, KitchenScene],
    })
    // Destrói o jogo ao sair da rota para não vazar canvas, listeners e loops
    return () => game.destroy(true)
  }, [])

  return <div ref={containerRef} className="aspect-video w-full max-w-5xl" aria-label="Área do jogo" />
}
