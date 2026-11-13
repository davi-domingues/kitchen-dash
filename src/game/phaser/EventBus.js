import Phaser from 'phaser'

// Única ponte entre as cenas do Phaser e o React (SYSTEM_DESIGN §3)
export const EventBus = new Phaser.Events.EventEmitter()
