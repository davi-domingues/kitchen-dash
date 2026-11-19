import { describe, expect, it } from 'vitest'
import { mergeSettings } from './settingsMerge.js'

const LOCAL_KEYS = { p1: { up: 'KeyI' } }
const ACCOUNT_KEYS = { p1: { up: 'KeyW' } }

describe('mergeSettings', () => {
  it('conta sem o campo recebe o valor local', () => {
    const result = mergeSettings({ keyBindings: LOCAL_KEYS }, {})

    expect(result).toEqual({ settings: { keyBindings: LOCAL_KEYS }, changedAccount: true })
  })

  it('conta com o campo vence o local', () => {
    const result = mergeSettings({ keyBindings: LOCAL_KEYS }, { keyBindings: ACCOUNT_KEYS })

    expect(result).toEqual({ settings: { keyBindings: ACCOUNT_KEYS }, changedAccount: false })
  })

  it('une campos diferentes e só marca mudança na conta pelo que faltava nela', () => {
    const result = mergeSettings({ reduceEffects: true }, { keyBindings: ACCOUNT_KEYS })

    expect(result.settings).toEqual({ reduceEffects: true, keyBindings: ACCOUNT_KEYS })
    expect(result.changedAccount).toBe(true)
  })

  it('local vazio não altera a conta', () => {
    expect(mergeSettings({}, { keyBindings: ACCOUNT_KEYS }).changedAccount).toBe(false)
  })
})
