import Phaser from 'phaser'
import { EventBus } from '../EventBus.js'

export class KitchenScene extends Phaser.Scene {
  constructor() {
    super('Kitchen')
  }

  create() {
    const { width, height } = this.scale
    this.add
      .text(width / 2, height / 2, 'Cozinha em construção', {
        fontFamily: 'sans-serif',
        fontSize: '32px',
        color: '#f5ead6',
      })
      .setOrigin(0.5)
    EventBus.emit('scene:ready', this)
  }
}
