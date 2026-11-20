import Phaser from 'phaser'
import { guardScene } from '../sceneErrorGuard.js'
import { EventBus } from '../EventBus.js'
import { SCENE_KEYS, nextSceneKey } from '../sceneKeys.js'

const BAR_WIDTH = 320
const BAR_HEIGHT = 16
const BAR_COLOR = 0xf5ead6

// Sem texto: a barra comunica o progresso sem depender do i18n
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.PRELOAD)
    guardScene(this, SCENE_KEYS.PRELOAD, (event, payload) => EventBus.emit(event, payload))
  }

  preload() {
    const { width, height } = this.scale
    const x = (width - BAR_WIDTH) / 2
    const y = (height - BAR_HEIGHT) / 2
    this.add.graphics().lineStyle(2, BAR_COLOR).strokeRect(x, y, BAR_WIDTH, BAR_HEIGHT)
    const bar = this.add.graphics()

    const onProgress = (value) => {
      bar
        .clear()
        .fillStyle(BAR_COLOR)
        .fillRect(x, y, BAR_WIDTH * value, BAR_HEIGHT)
    }
    this.load.on(Phaser.Loader.Events.PROGRESS, onProgress)
    // O loader pertence ao plugin da cena e sobrevive a um restart: o listener sai junto com ela
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.load.off(Phaser.Loader.Events.PROGRESS, onProgress)
    })
  }

  create() {
    this.scene.start(nextSceneKey(SCENE_KEYS.PRELOAD))
  }
}
