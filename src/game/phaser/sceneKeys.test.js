import { describe, expect, it } from 'vitest'
import { SCENE_KEYS, SCENE_ORDER, nextSceneKey } from './sceneKeys.js'

describe('ordem das cenas', () => {
  it('segue Boot → Preload → Kitchen', () => {
    expect(SCENE_ORDER).toEqual([SCENE_KEYS.BOOT, SCENE_KEYS.PRELOAD, SCENE_KEYS.KITCHEN])
  })

  it('devolve a próxima cena de cada etapa', () => {
    expect(nextSceneKey(SCENE_KEYS.BOOT)).toBe(SCENE_KEYS.PRELOAD)
    expect(nextSceneKey(SCENE_KEYS.PRELOAD)).toBe(SCENE_KEYS.KITCHEN)
  })

  it('não tem cena depois da cozinha', () => {
    expect(nextSceneKey(SCENE_KEYS.KITCHEN)).toBeNull()
  })

  it('rejeita cena desconhecida', () => {
    expect(() => nextSceneKey('Menu')).toThrow('Menu')
  })
})
