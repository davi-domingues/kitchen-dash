// HUD placeholder (texto e retângulos) até a arte do KD-19. Só desenha o modelo de hudModel.js.
import { getRecipe } from '../../content/index.js'
import { t } from '../../i18n/index.js'
import { PATIENCE_BANDS } from './hudModel.js'

export const HUD_HEIGHT = 96

const PADDING = 12
const CARD = Object.freeze({ width: 92, height: 72, gap: 8, bar: 8 })
const COLORS = Object.freeze({
  background: 0x1b1412,
  card: 0xf5ead6,
  barTrack: 0x5a4a44,
  [PATIENCE_BANDS.OK]: 0x3ad65a,
  [PATIENCE_BANDS.WARN]: 0xf2c230,
  [PATIENCE_BANDS.DANGER]: 0xe0442f,
})
const textStyle = (size, color = '#f5ead6') => ({ fontFamily: 'sans-serif', fontSize: `${size}px`, color })

/**
 * @param {Phaser.Scene} scene
 * @param {{ onEnd: () => void }} handlers
 */
export function createHudView(scene, { onEnd }) {
  const { width } = scene.scale
  scene.add.rectangle(0, 0, width, HUD_HEIGHT, COLORS.background).setOrigin(0)
  const cards = scene.add.graphics()
  const cardTexts = []
  const score = scene.add.text(width - PADDING, PADDING, '', textStyle(22)).setOrigin(1, 0)
  const clock = scene.add.text(width - PADDING, PADDING + 30, '', textStyle(28)).setOrigin(1, 0)
  const queued = scene.add.text(PADDING, HUD_HEIGHT - PADDING, '', textStyle(14)).setOrigin(0, 1)
  const endButton = scene.add
    .text(width / 2 + 200, HUD_HEIGHT / 2, t('game.hud.end'), textStyle(18))
    .setOrigin(0.5)
    .setPadding(8, 4)
    .setBackgroundColor('#7a2e22')
    .setInteractive({ useHandCursor: true })
    .setVisible(false)
  endButton.on('pointerup', onEnd)
  // Evita refazer textos e gráficos quando nada mudou entre quadros
  let lastKey = ''

  function cardText(index) {
    if (!cardTexts[index]) {
      cardTexts[index] = scene.add.text(0, 0, '', textStyle(20, '#1b1b1b')).setOrigin(0.5, 0)
    }
    return cardTexts[index]
  }

  function render(model) {
    const key = JSON.stringify(model)
    if (key === lastKey) return
    lastKey = key
    score.setText(t('game.hud.score', { score: model.score }))
    clock.setText(model.clock.text)
    queued.setText(model.queued > 0 ? t('game.hud.queued', { count: model.queued }) : '')
    endButton.setVisible(model.canEnd)

    cards.clear()
    cardTexts.forEach((text) => text.setVisible(false))
    model.orders.forEach((order, i) => {
      const x = PADDING + i * (CARD.width + CARD.gap)
      const y = PADDING / 2
      cards.fillStyle(COLORS.card).fillRoundedRect(x, y, CARD.width, CARD.height, 6)
      const label = `${getRecipe(order.recipeId).emoji} ${t('game.hud.order', { number: order.number })}`
      cardText(i)
        .setText(label)
        .setPosition(x + CARD.width / 2, y + 10)
        .setVisible(true)
      if (order.band === null) return
      const barY = y + CARD.height - CARD.bar - 8
      const barWidth = CARD.width - 16
      cards.fillStyle(COLORS.barTrack).fillRect(x + 8, barY, barWidth, CARD.bar)
      cards.fillStyle(COLORS[order.band]).fillRect(x + 8, barY, barWidth * order.fraction, CARD.bar)
    })
  }

  return { render }
}
