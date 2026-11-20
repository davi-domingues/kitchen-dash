import Phaser from 'phaser'
import { guardScene } from '../sceneErrorGuard.js'
import { CONTENT_VERSION, INGREDIENTS, KITCHENS, RECIPES } from '../../../content/index.js'
import { CORE_EVENTS } from '../../core/coreEvents.js'
import { getDailyChallengeResult } from '../../core/dailyChallenge/index.js'
import {
  consumeAutoActions,
  filterManualDuplicates,
  selectAutoActions,
  setIdleBlocked,
} from '../../core/idleSystem.js'
import { canInteract } from '../../core/stations.js'
import { findTargetStation } from '../../core/kitchenMap.js'
import { toStationInputs } from '../../core/kitchenUpdate.js'
import { createMatch, endMatch } from '../../core/match.js'
import { DEFAULT_MATCH_CONFIG } from '../../core/matchModes.js'
import { MATCH_STATUS, pauseMatch, resumeMatch } from '../../core/matchState.js'
import { MOVE_ACTION } from '../../core/movementSystem.js'
import { STATION_ACTIONS } from '../../core/stationsSystem.js'
import { DEFAULT_KEY_BINDINGS } from '../../input/keyBindings.js'
import { INPUT_EVENTS, createInputMap } from '../../input/inputMap.js'
import { EventBus } from '../EventBus.js'
import { GAME_EVENTS } from '../events.js'
import { buildHudModel } from '../hudModel.js'
import { HUD_HEIGHT, createHudView } from '../hudView.js'
import { createKitchenView } from '../kitchenView.js'
import { createMatchEndGuard } from '../matchEndGuard.js'
import { resolveLook } from '../cosmeticLook.js'
import { COSMETIC_LOOK_KEY, KEY_BINDINGS_KEY, MATCH_CONFIG_KEY } from '../registryKeys.js'
import { SCENE_KEYS } from '../sceneKeys.js'

const ACTION_BY_EVENT = Object.freeze({
  [INPUT_EVENTS.TAP]: STATION_ACTIONS.TAP,
  [INPUT_EVENTS.HOLD_START]: STATION_ACTIONS.HOLD_START,
  [INPUT_EVENTS.HOLD_END]: STATION_ACTIONS.HOLD_END,
})

// Seed nova a cada partida; o Desafio troca pela seed fixa dentro do core
const randomSeed = () => crypto.getRandomValues(new Uint32Array(1))[0] >>> 1

export class KitchenScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.KITCHEN)
    guardScene(this, SCENE_KEYS.KITCHEN, (event, payload) => EventBus.emit(event, payload))
  }

  // Modo, jogadores e teclas vêm do React pelo registry (game/phaser não importa services)
  init() {
    const { mode, players } = this.registry.get(MATCH_CONFIG_KEY) ?? DEFAULT_MATCH_CONFIG
    this.kitchen = KITCHENS[0]
    this.content = { recipes: RECIPES, ingredients: INGREDIENTS, kitchen: this.kitchen }
    const match = createMatch({
      mode,
      players,
      seed: randomSeed(),
      contentVersion: CONTENT_VERSION,
      content: this.content,
    })
    this.match = match.state
    this.step = match.update
    // Identificador da partida para a idempotência do submit_score (KD-21)
    this.takeMatchEnded = createMatchEndGuard(crypto.randomUUID())
    const bindings = this.registry.get(KEY_BINDINGS_KEY) ?? DEFAULT_KEY_BINDINGS
    this.inputMap = createInputMap({ bindings, playerCount: players })
    this.pendingActions = []
    this.deliveredByRecipe = {}
  }

  create() {
    const { width, height } = this.scale
    this.hud = createHudView(this, { onEnd: this.requestEnd })
    this.view = createKitchenView(
      this,
      this.kitchen,
      this.match,
      {
        x: 0,
        y: HUD_HEIGHT,
        width,
        height: height - HUD_HEIGHT,
      },
      resolveLook(this.registry.get(COSMETIC_LOOK_KEY)),
    )
    this.input.keyboard.on('keydown', this.onKeyDown, this)
    this.input.keyboard.on('keyup', this.onKeyUp, this)
    this.game.events.on(Phaser.Core.Events.BLUR, this.onBlur, this)
    this.game.events.on(Phaser.Core.Events.FOCUS, this.onFocus, this)
    EventBus.on(GAME_EVENTS.MATCH_RESUMED, this.resume, this)
    EventBus.on(GAME_EVENTS.MATCH_END_REQUESTED, this.requestEnd, this)
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
    this.match = setIdleBlocked(this.match, true)
  }

  onFocus() {
    this.match = setIdleBlocked(this.match, false)
  }

  queue(inputEvents) {
    for (const { type, player } of inputEvents) {
      if (type === INPUT_EVENTS.PAUSE) this.pause()
      const action = ACTION_BY_EVENT[type]
      if (action) this.pendingActions.push({ chefId: player, action })
    }
  }

  pause() {
    if (this.match.status !== MATCH_STATUS.RUNNING) return
    this.match = pauseMatch(setIdleBlocked(this.match, true))
    // Teclas seguradas durante o menu não chegam como keyup: soltar evita chef andando ao retomar
    this.inputMap.releaseAll()
    this.pendingActions = []
    EventBus.emit(GAME_EVENTS.MATCH_PAUSED)
  }

  resume() {
    this.match = resumeMatch(setIdleBlocked(this.match, false))
  }

  // Arrow function: vira handler do botão do HUD sem bind
  requestEnd = () => {
    this.apply(endMatch(this.match))
  }

  trackDailyChallengeStats(events) {
    for (const event of events) {
      if (event.type === CORE_EVENTS.ORDER_DELIVERED) {
        const recipeId = event.payload?.recipeId
        if (!recipeId) continue
        this.deliveredByRecipe[recipeId] = (this.deliveredByRecipe[recipeId] ?? 0) + 1
      }
    }
  }

  // Aplica o resultado do core; o guard garante um único match:ended por partida
  apply({ state, events }) {
    this.match = state
    this.trackDailyChallengeStats(events)
    const payload = this.takeMatchEnded(events)
    if (payload) {
      const summary = {
        mode: payload.mode,
        score: payload.score,
        missedOrders: payload.ordersFailed,
        deliveredByRecipe: this.deliveredByRecipe,
      }
      const dailyChallengeResult = getDailyChallengeResult({ summary })
      EventBus.emit(GAME_EVENTS.MATCH_ENDED, { ...payload, dailyChallengeResult })
    }
  }

  update(time, delta) {
    if (this.match.status !== MATCH_STATUS.RUNNING) return
    this.queue(this.inputMap.update(time))
    const moves = this.match.chefs.map(({ id }) => ({
      chefId: id,
      action: MOVE_ACTION,
      ...this.inputMap.getMove(id),
    }))
    const manualActions = filterManualDuplicates(this.match, this.pendingActions)
    // Botão e movimento do mesmo frame cancelam o auto-uso pendente do chef
    const busyChefs = [...manualActions, ...moves.filter(({ x, y }) => x !== 0 || y !== 0)]
    const autoActions = selectAutoActions(this.match, busyChefs)
    const inputs = [...moves, ...toStationInputs(this.match, manualActions), ...autoActions]
    this.pendingActions = []
    // Consumir antes do step evita reenviar a mesma decisão no frame seguinte
    this.apply(this.step(consumeAutoActions(this.match, autoActions), inputs, delta))
    this.draw()
  }

  draw() {
    const stationContent = { ...this.content, stoveBurnAfterMs: this.kitchen.stoveBurnAfterMs }
    const targets = this.match.chefs.flatMap(({ id }) => {
      const station = findTargetStation(this.match, id)
      return station
        ? [{ chefId: id, station, ready: canInteract(this.match, stationContent, id, station.id) }]
        : []
    })
    this.view.render(this.match, targets)
    this.hud.render(buildHudModel(this.match))
  }

  cleanup() {
    this.time.removeAllEvents()
    this.tweens.killAll()
    this.input.keyboard?.removeAllListeners()
    this.game.events.off(Phaser.Core.Events.BLUR, this.onBlur, this)
    this.game.events.off(Phaser.Core.Events.FOCUS, this.onFocus, this)
    EventBus.off(GAME_EVENTS.MATCH_RESUMED, this.resume, this)
    EventBus.off(GAME_EVENTS.MATCH_END_REQUESTED, this.requestEnd, this)
    this.inputMap.releaseAll()
    this.view.destroy()
    this.hud.destroy()
  }
}
