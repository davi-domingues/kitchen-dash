import Phaser from 'phaser'
import { t } from '../../../i18n/index.js'
import { EventBus } from '../EventBus.js'
import { GAME_EVENTS } from '../events.js'
import { SCENE_KEYS } from '../sceneKeys.js'

export class KitchenScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.KITCHEN)
  }

  create() {
    const { width, height } = this.scale
    this.add
      .text(width / 2, height / 2, t('game.kitchen.underConstruction'), {
        fontFamily: 'sans-serif',
        fontSize: '32px',
        color: '#f5ead6',
      })
      .setOrigin(0.5)
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
