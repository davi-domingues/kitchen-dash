import Phaser from 'phaser'
import { guardScene } from '../sceneErrorGuard.js'
import { EventBus } from '../EventBus.js'
import { SCENE_KEYS, nextSceneKey } from '../sceneKeys.js'

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.BOOT)
    guardScene(this, SCENE_KEYS.BOOT, (event, payload) => EventBus.emit(event, payload))
  }

  create() {
    this.scene.start(nextSceneKey(SCENE_KEYS.BOOT))
  }
}
