// HUD no estilo do protótipo (KD-19): comandas de papel e caixas de pontos/tempo.
// Só desenha o modelo de hudModel.js.
import { getRecipe } from '../../content/index.js'
import { t } from '../../i18n/index.js'
import { EMOJI_FONT, TEXT_FONT, TITLE_FONT } from './fonts.js'
import { PATIENCE_BANDS } from './hudModel.js'

export const HUD_HEIGHT = 96

const PADDING = 10
const TICKET = Object.freeze({ width: 104, height: 76, gap: 8, top: 6, bar: 7 })
const STAT = Object.freeze({ width: 104, height: 52, gap: 8 })
const COLORS = Object.freeze({
  background: 0xfbf3e4,
  awning: 0x7a1f2b,
  paper: 0xfffaf0,
  paperEdge: 0xe6d6bd,
  barTrack: 0xeadcc6,
})
// Borda superior da ficha e barra de paciência por faixa, como no protótipo
const TICKET_TOP = Object.freeze({
  [PATIENCE_BANDS.OK]: 0x7a1f2b,
  [PATIENCE_BANDS.WARN]: 0xd9a441,
  [PATIENCE_BANDS.DANGER]: 0xc0392b,
})
const PATIENCE_BAR = Object.freeze({
  [PATIENCE_BANDS.OK]: 0x3f7d4e,
  [PATIENCE_BANDS.WARN]: 0xd9a441,
  [PATIENCE_BANDS.DANGER]: 0xc0392b,
})
const INK = '#2b1d16'
const WINE = '#7a1f2b'
const MUTED = '#8a7565'
const textStyle = (size, color = INK, fontFamily = TEXT_FONT) => ({
  fontFamily,
  fontSize: `${size}px`,
  fontStyle: 'bold',
  color,
})

/**
 * @param {Phaser.Scene} scene
 * @param {{ onEnd: () => void }} handlers
 */
export function createHudView(scene, { onEnd }) {
  const { width } = scene.scale
  const objects = []
  const keep = (object) => {
    objects.push(object)
    return object
  }
  const frame = keep(scene.add.graphics())
  frame.fillStyle(COLORS.background).fillRect(0, 0, width, HUD_HEIGHT)
  // Toldo listrado do protótipo no topo
  for (let x = 0; x < width; x += 52) frame.fillStyle(COLORS.awning).fillRect(x, 0, 26, 4)

  const statsX = width - PADDING - 2 * STAT.width - STAT.gap
  const statY = (HUD_HEIGHT - STAT.height) / 2
  const stat = (index, label) => {
    const x = statsX + index * (STAT.width + STAT.gap)
    frame.fillStyle(COLORS.paper).fillRoundedRect(x, statY, STAT.width, STAT.height, 10)
    frame.lineStyle(1, COLORS.paperEdge).strokeRoundedRect(x, statY, STAT.width, STAT.height, 10)
    keep(scene.add.text(x + STAT.width / 2, statY + 6, label, textStyle(11, MUTED)).setOrigin(0.5, 0))
    return keep(
      scene.add.text(x + STAT.width / 2, statY + 20, '', textStyle(22, WINE, TITLE_FONT)).setOrigin(0.5, 0),
    )
  }
  const score = stat(0, t('game.hud.scoreLabel'))
  const clock = stat(1, t('game.hud.timeLabel'))

  const cards = keep(scene.add.graphics())
  const cardTexts = []
  const queued = keep(
    scene.add.text(statsX - PADDING, HUD_HEIGHT - PADDING, '', textStyle(13, WINE)).setOrigin(1, 1),
  )
  const endButton = keep(
    scene.add
      .text(statsX - PADDING, PADDING + 4, t('game.hud.end'), textStyle(15, '#fbf3e4'))
      .setOrigin(1, 0)
      .setPadding(10, 6)
      .setBackgroundColor(WINE)
      .setInteractive({ useHandCursor: true })
      .setVisible(false),
  )
  endButton.on('pointerup', onEnd)
  // Evita refazer textos e gráficos quando nada mudou entre quadros
  let lastKey = ''

  function cardText(index) {
    if (!cardTexts[index]) {
      cardTexts[index] = {
        emoji: keep(scene.add.text(0, 0, '', { fontFamily: EMOJI_FONT, fontSize: '26px' }).setOrigin(0.5, 0)),
        number: keep(scene.add.text(0, 0, '', textStyle(12)).setOrigin(0, 0)),
      }
    }
    return cardTexts[index]
  }

  function render(model) {
    const key = JSON.stringify(model)
    if (key === lastKey) return
    lastKey = key
    score.setText(String(model.score))
    clock.setText(model.clock.text)
    queued.setText(model.queued > 0 ? t('game.hud.queued', { count: model.queued }) : '')
    endButton.setVisible(model.canEnd)

    cards.clear()
    cardTexts.forEach(({ emoji, number }) => {
      emoji.setVisible(false)
      number.setVisible(false)
    })
    model.orders.forEach((order, i) => {
      const x = PADDING + i * (TICKET.width + TICKET.gap)
      const y = (HUD_HEIGHT - TICKET.height) / 2 + 2
      const band = order.band ?? PATIENCE_BANDS.OK
      cards.fillStyle(COLORS.paper).fillRoundedRect(x, y, TICKET.width, TICKET.height, 8)
      cards.lineStyle(1, COLORS.paperEdge).strokeRoundedRect(x, y, TICKET.width, TICKET.height, 8)
      cards
        .fillStyle(TICKET_TOP[band])
        .fillRoundedRect(x, y, TICKET.width, TICKET.top, { tl: 6, tr: 6, bl: 0, br: 0 })
      const texts = cardText(i)
      texts.number
        .setText(t('game.hud.order', { number: order.number }))
        .setPosition(x + 6, y + TICKET.top + 2)
        .setVisible(true)
      texts.emoji
        .setText(getRecipe(order.recipeId).emoji)
        .setPosition(x + TICKET.width / 2, y + TICKET.top + 12)
        .setVisible(true)
      if (order.band === null) return
      const barY = y + TICKET.height - TICKET.bar - 6
      const barWidth = TICKET.width - 12
      cards.fillStyle(COLORS.barTrack).fillRoundedRect(x + 6, barY, barWidth, TICKET.bar, 3)
      if (order.fraction > 0) {
        const fill = barWidth * order.fraction
        cards
          .fillStyle(PATIENCE_BAR[band])
          .fillRoundedRect(x + 6, barY, fill, TICKET.bar, Math.min(3, fill / 2))
      }
    })
  }

  function destroy() {
    objects.forEach((object) => object.destroy())
  }

  return { render, destroy }
}
