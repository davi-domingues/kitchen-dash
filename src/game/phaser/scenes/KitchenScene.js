import Phaser from 'phaser'
import { CONTENT_VERSION, INGREDIENTS, KITCHENS, RECIPES, getKitchen } from '../../../content/index.js'
import { canInteract } from '../../core/stations.js'
import { findTargetStation } from '../../core/kitchenMap.js'
import { createKitchenMatch, createKitchenUpdate, toStationInputs } from '../../core/kitchenUpdate.js'
import { MOVE_ACTION } from '../../core/movementSystem.js'
import { STATION_ACTIONS } from '../../core/stationsSystem.js'
import { DEFAULT_KEY_BINDINGS } from '../../input/keyBindings.js'
import { INPUT_EVENTS, createInputMap } from '../../input/inputMap.js'
import { EventBus } from '../EventBus.js'
import { GAME_EVENTS } from '../events.js'
import { createKitchenView } from '../kitchenView.js'
import { SCENE_KEYS } from '../sceneKeys.js'

const ACTION_BY_EVENT = Object.freeze({
  [INPUT_EVENTS.TAP]: STATION_ACTIONS.TAP,
  [INPUT_EVENTS.HOLD_START]: STATION_ACTIONS.HOLD_START,
  [INPUT_EVENTS.HOLD_END]: STATION_ACTIONS.HOLD_END,
})

// Seed fixa até o KD-15/KD-21 passarem a do modo escolhido
const DEFAULT_SEED = 1

export class KitchenScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.KITCHEN)
  }

  /**
   * Dados opcionais até o React (KD-21) escolher modo e jogadores. As teclas vêm do React
   * (services/settings), porque a cena não acessa services.
   */
  init({ kitchenId = KITCHENS[0].id, playerCount = 1, seed = DEFAULT_SEED, mode = 'free', bindings } = {}) {
    this.kitchen = getKitchen(kitchenId)
    this.match = createKitchenMatch({
      kitchen: this.kitchen,
      playerCount,
      seed,
      mode,
      contentVersion: CONTENT_VERSION,
    })
    this.content = {
      recipes: RECIPES,
      ingredients: INGREDIENTS,
      stoveBurnAfterMs: this.kitchen.stoveBurnAfterMs,
    }
    this.step = createKitchenUpdate({ kitchen: this.kitchen, content: this.content })
    this.inputMap = createInputMap({ bindings: bindings ?? DEFAULT_KEY_BINDINGS, playerCount })
    this.pendingActions = []
  }

  create() {
    this.view = createKitchenView(this, this.kitchen, this.match)
    this.input.keyboard.on('keydown', this.onKeyDown, this)
    this.input.keyboard.on('keyup', this.onKeyUp, this)
    this.game.events.on(Phaser.Core.Events.BLUR, this.onBlur, this)
    // Listeners, timers e tweens não podem sobreviver ao fim da cena (AGENTS.md §4)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this)
    this.draw()
    EventBus.emit(GAME_EVENTS.SCENE_READY, this)
  }

  onKeyDown(event) {
    this.queue(this.inputMap.keyDown(event.code, this.time.now))
  }

  onKeyUp(event) {
    this.queue(this.inputMap.keyUp(event.code))
  }

  onBlur() {
    this.inputMap.releaseAll()
  }

  // Pausa (KD-20) ainda não tem tela: só as ações de estação seguem para o core
  queue(inputEvents) {
    for (const { type, player } of inputEvents) {
      const action = ACTION_BY_EVENT[type]
      if (action) this.pendingActions.push({ chefId: player, action })
    }
  }

  update(time, delta) {
    this.queue(this.inputMap.update(time))
    const moves = this.match.chefs.map(({ id }) => ({
      chefId: id,
      action: MOVE_ACTION,
      ...this.inputMap.getMove(id),
    }))
    const inputs = [...moves, ...toStationInputs(this.match, this.pendingActions)]
    this.pendingActions = []
    this.match = this.step(this.match, inputs, delta).state
    this.draw()
  }

  draw() {
    const targets = this.match.chefs.flatMap(({ id }) => {
      const station = findTargetStation(this.match, id)
      return station
        ? [{ chefId: id, station, ready: canInteract(this.match, this.content, id, station.id) }]
        : []
    })
    this.view.render(this.match, targets)
  }

  cleanup() {
    this.time.removeAllEvents()
    this.tweens.killAll()
    this.input.keyboard?.removeAllListeners()
    this.game.events.off(Phaser.Core.Events.BLUR, this.onBlur, this)
    this.inputMap.releaseAll()
  }
}
