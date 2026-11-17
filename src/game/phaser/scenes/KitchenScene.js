import Phaser from 'phaser'
import { EventBus } from '../EventBus.js'
import { GAME_EVENTS } from '../events.js'
import { SCENE_KEYS } from '../sceneKeys.js'

export class KitchenScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.KITCHEN)
  }

  create() {
    // Listeners, timers e tweens não podem sobreviver ao fim da cena (AGENTS.md §4)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this)
    EventBus.emit(GAME_EVENTS.SCENE_READY, this)
  }

  cleanup() {
    this.time.removeAllEvents()
    this.tweens.killAll()
    this.input.keyboard?.removeAllListeners()
  }
}
