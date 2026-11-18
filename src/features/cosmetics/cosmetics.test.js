import { describe, expect, it } from 'vitest'
import {
  applyAccountEquipped,
  applyScore,
  createEmptyCosmetics,
  equip,
  getLook,
  isUnlocked,
  mergeUnlocked,
  sanitizeCosmetics,
} from './cosmetics.js'

describe('createEmptyCosmetics', () => {
  it('começa só com os itens de custo 0, equipados', () => {
    const state = createEmptyCosmetics()

    expect(state.bestScore).toBe(0)
    expect(state.unlocked).toEqual(['hat_classic', 'apron_cream', 'theme_bistro'])
    expect(state.equipped).toEqual({ hat: 'hat_classic', apron: 'apron_cream', theme: 'theme_bistro' })
  })
})

describe('applyScore', () => {
  it('desbloqueia tudo com unlockScore ≤ pontuação, na ordem do catálogo', () => {
    const { state, newlyUnlocked } = applyScore(createEmptyCosmetics(), 320)

    expect(newlyUnlocked).toEqual(['hat_bordeaux', 'apron_herbs'])
    expect(state.bestScore).toBe(320)
    expect(isUnlocked(state, 'hat_bordeaux')).toBe(true)
  })

  it('pontuação abaixo do recorde não desbloqueia nada', () => {
    const start = applyScore(createEmptyCosmetics(), 500).state

    const { state, newlyUnlocked } = applyScore(start, 300)

    expect(newlyUnlocked).toEqual([])
    expect(state).toBe(start)
  })

  it('novo recorde sem item novo atualiza só o bestScore', () => {
    const start = applyScore(createEmptyCosmetics(), 320).state

    const { state, newlyUnlocked } = applyScore(start, 350)

    expect(newlyUnlocked).toEqual([])
    expect(state.bestScore).toBe(350)
  })

  it('ignora pontuação inválida', () => {
    const start = createEmptyCosmetics()

    expect(applyScore(start, -10).state).toBe(start)
    expect(applyScore(start, 1.5).state).toBe(start)
    expect(applyScore(start, '900').state).toBe(start)
  })
})

describe('mergeUnlocked', () => {
  it('une ids da conta e ignora os desconhecidos e repetidos', () => {
    const { state, newlyUnlocked } = mergeUnlocked(createEmptyCosmetics(), [
      'theme_marble',
      'nope',
      'hat_classic',
    ])

    expect(newlyUnlocked).toEqual(['theme_marble'])
    expect(isUnlocked(state, 'theme_marble')).toBe(true)
  })

  it('aceita entrada que não é lista', () => {
    const start = createEmptyCosmetics()

    expect(mergeUnlocked(start, null)).toEqual({ state: start, newlyUnlocked: [] })
  })

  it('não perde itens ganhos quando a pontuação não basta', () => {
    const merged = mergeUnlocked(createEmptyCosmetics(), ['hat_gold']).state

    expect(isUnlocked(applyScore(merged, 10).state, 'hat_gold')).toBe(true)
  })
})

describe('equip', () => {
  it('equipa um item ganho no slot dele', () => {
    const start = applyScore(createEmptyCosmetics(), 320).state

    expect(equip(start, 'apron_herbs').equipped.apron).toBe('apron_herbs')
  })

  it('não equipa item bloqueado nem desconhecido', () => {
    const start = createEmptyCosmetics()

    expect(equip(start, 'hat_gold')).toBe(start)
    expect(equip(start, 'nope')).toBe(start)
  })
})

describe('sanitizeCosmetics', () => {
  it('devolve o estado vazio para entrada inválida', () => {
    expect(sanitizeCosmetics(null)).toEqual(createEmptyCosmetics())
    expect(sanitizeCosmetics('x')).toEqual(createEmptyCosmetics())
  })

  it('mantém dados válidos', () => {
    const valid = equip(applyScore(createEmptyCosmetics(), 600).state, 'hat_navy')

    expect(sanitizeCosmetics(JSON.parse(JSON.stringify(valid)))).toEqual(valid)
  })

  it('descarta ids desconhecidos, bestScore inválido e equipado bloqueado ou de outro slot', () => {
    const state = sanitizeCosmetics({
      bestScore: -3,
      unlocked: ['nope', 42, 'apron_herbs'],
      equipped: { hat: 'hat_gold', apron: 'apron_herbs', theme: 'hat_classic' },
    })

    expect(state.bestScore).toBe(0)
    expect(state.unlocked).toEqual(['hat_classic', 'apron_cream', 'apron_herbs', 'theme_bistro'])
    expect(state.equipped).toEqual({ hat: 'hat_classic', apron: 'apron_herbs', theme: 'theme_bistro' })
  })
})

describe('getLook', () => {
  it('devolve as cores dos itens equipados', () => {
    const state = equip(applyScore(createEmptyCosmetics(), 1000).state, 'hat_gold')

    expect(getLook(state)).toEqual({ hat: '#c9a227', apron: '#f5ead6', theme: '#7b1e3a' })
  })
})

describe('applyAccountEquipped', () => {
  it('a conta vence nos slots com item liberado', () => {
    const start = mergeUnlocked(createEmptyCosmetics(), ['hat_navy']).state

    const state = applyAccountEquipped(start, { hat: 'hat_navy' })

    expect(state.equipped.hat).toBe('hat_navy')
    expect(state.equipped.apron).toBe('apron_cream')
  })

  it('ignora item bloqueado, desconhecido ou no slot errado', () => {
    const start = createEmptyCosmetics()

    const state = applyAccountEquipped(start, { hat: 'hat_gold', apron: 'nope', theme: 'hat_classic' })

    expect(state).toEqual(start)
  })

  it('equipado ausente ou inválido não muda nada', () => {
    const start = createEmptyCosmetics()

    expect(applyAccountEquipped(start, null)).toBe(start)
    expect(applyAccountEquipped(start, 'x')).toBe(start)
  })
})
