import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
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

const usedKeys = new Set(
  sourceFiles(SRC).flatMap((file) =>
    [...readFileSync(file, 'utf8').matchAll(/\bt\(\s*['"]([\w.]+)['"]/g)].map((m) => m[1]),
  ),
)
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
