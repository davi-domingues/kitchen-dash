import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { COSMETICS, contentKey, INGREDIENTS, KITCHENS, RECIPES } from '../content/index.js'
import { t } from './index.js'
import ptBR from './pt-BR.json'

const SRC = join(import.meta.dirname, '..')

function sourceFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return /\.(js|jsx)$/.test(name) && !name.endsWith('.test.js') ? [path] : []
  })
}

function flatKeys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([key, value]) =>
    typeof value === 'object' ? flatKeys(value, `${prefix}${key}.`) : [`${prefix}${key}`],
  )
}

// Nomes de conteúdo são chaves dinâmicas `<tipo>.<id>.name`, derivadas dos JSON
const contentKeys = [
  ['ingredient', INGREDIENTS],
  ['recipe', RECIPES],
  ['kitchen', KITCHENS],
  ['cosmetic', COSMETICS],
].flatMap(([type, items]) => items.map(({ id }) => contentKey(type, id)))

const usedKeys = new Set([
  ...contentKeys,
  ...sourceFiles(SRC).flatMap((file) =>
    [...readFileSync(file, 'utf8').matchAll(/\bt\(\s*['"]([\w.]+)['"]/g)].map((m) => m[1]),
  ),
])
const dictionaryKeys = flatKeys(ptBR)

describe('i18n pt-BR', () => {
  it('traduz uma chave existente', () => {
    expect(t('home.play')).toBe('Jogar')
  })

  it('tem no dicionário toda chave usada no código', () => {
    const missing = [...usedKeys].filter((key) => !dictionaryKeys.includes(key))

    expect(missing).toEqual([])
  })

  it('não tem chaves sem uso no dicionário', () => {
    const unused = dictionaryKeys.filter((key) => !usedKeys.has(key))

    expect(unused).toEqual([])
  })
})
