import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createStorage } from './storage.js'

function fakeBackend(initial = {}) {
  const data = { ...initial }
  return {
    data,
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = String(value)
    },
    removeItem: (key) => {
      delete data[key]
    },
  }
}

function throwingBackend() {
  const fail = () => {
    throw new DOMException('bloqueado', 'SecurityError')
  }
  return { getItem: fail, setItem: fail, removeItem: fail }
}

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('storage', () => {
  it('grava e lê com prefixo versionado', () => {
    const backend = fakeBackend()
    const storage = createStorage({ backend })

    storage.set('records', { classic: 420 })

    expect(backend.data['kd:v1:records']).toBe('{"v":1,"data":{"classic":420}}')
    expect(storage.get('records')).toEqual({ classic: 420 })
  })

  it('devolve o fallback quando a chave não existe', () => {
    const storage = createStorage({ backend: fakeBackend() })

    expect(storage.get('nada', [])).toEqual([])
  })

  it('descarta JSON inválido e devolve o fallback', () => {
    const backend = fakeBackend({ 'kd:v1:records': '{quebrado' })
    const storage = createStorage({ backend })

    const value = storage.get('records', 'padrão')

    expect(value).toBe('padrão')
    expect(backend.data['kd:v1:records']).toBeUndefined()
  })

  it('descarta valores fora do formato { v, data }', () => {
    const storage = createStorage({ backend: fakeBackend({ 'kd:v1:records': '42' }) })

    expect(storage.get('records', null)).toBeNull()
  })

  it('aplica migrations de versões anteriores e regrava na versão atual', () => {
    const backend = fakeBackend({ 'kd:v1:settings': '{"v":1,"data":{"som":true}}' })
    const storage = createStorage({
      backend,
      version: 2,
      migrations: { 1: (data) => ({ audio: { enabled: data.som } }) },
    })

    const value = storage.get('settings')

    expect(value).toEqual({ audio: { enabled: true } })
    expect(backend.data['kd:v1:settings']).toBeUndefined()
    expect(JSON.parse(backend.data['kd:v2:settings'])).toEqual({ v: 2, data: { audio: { enabled: true } } })
  })

  it('descarta o valor quando falta uma migration', () => {
    const storage = createStorage({
      backend: fakeBackend({ 'kd:v1:settings': '{"v":1,"data":{}}' }),
      version: 2,
    })

    expect(storage.get('settings', 'padrão')).toBe('padrão')
  })

  it('continua funcionando em memória quando o backend lança erro', () => {
    const storage = createStorage({ backend: throwingBackend() })

    storage.set('records', [1, 2])

    expect(storage.get('records')).toEqual([1, 2])
    expect(storage.isPersistent).toBe(false)
  })

  it('usa memória quando o localStorage global está bloqueado', () => {
    vi.stubGlobal('localStorage', throwingBackend())
    const storage = createStorage()

    storage.set('x', 1)

    expect(storage.get('x')).toBe(1)
    expect(storage.isPersistent).toBe(false)
  })
})
