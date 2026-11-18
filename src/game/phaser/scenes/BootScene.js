import Phaser from 'phaser'
import { SCENE_KEYS, nextSceneKey } from '../sceneKeys.js'

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.BOOT)
  }

  create() {
    this.scene.start(nextSceneKey(SCENE_KEYS.BOOT))
  }
}
