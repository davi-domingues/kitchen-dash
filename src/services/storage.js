// Armazenamento local versionado (SYSTEM_DESIGN §7.2). Único módulo que toca o localStorage.
// Cada valor é gravado como { v, data } em `kd:v<STORAGE_VERSION>:<chave>`. Ao ler um valor de versão
// anterior, as migrations são aplicadas em ordem e o resultado é regravado na versão atual.

export const STORAGE_PREFIX = 'kd'
export const STORAGE_VERSION = 1

function memoryBackend() {
  const map = new Map()
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
  }
}

// localStorage pode lançar ao ser acessado (modo privado, cookies bloqueados, iframe sandbox)
function detectBackend() {
  try {
    const ls = globalThis.localStorage
    const probe = `${STORAGE_PREFIX}:probe`
    ls.setItem(probe, '1')
    ls.removeItem(probe)
    return { backend: ls, persistent: true }
  } catch {
    return { backend: memoryBackend(), persistent: false }
  }
}

/**
 * @param {object} [options]
 * @param {Storage} [options.backend] backend com getItem/setItem/removeItem (padrão: localStorage ou memória)
 * @param {number} [options.version] versão atual do schema local
 * @param {Record<number, (data: unknown, key: string) => unknown>} [options.migrations]
 *   migrations[n] converte dados da versão n para n + 1
 */
export function createStorage({ backend, version = STORAGE_VERSION, migrations = {} } = {}) {
  const detected = backend ? { backend, persistent: true } : detectBackend()
  let store = detected.backend
  let persistent = detected.persistent

  const keyFor = (key, v = version) => `${STORAGE_PREFIX}:v${v}:${key}`

  function fallBackToMemory(error) {
    if (!persistent) return
    console.warn('[storage] armazenamento local indisponível; usando memória nesta sessão', error)
    store = memoryBackend()
    persistent = false
  }

  function safely(operation) {
    try {
      return operation(store)
    } catch (error) {
      fallBackToMemory(error)
      return operation(store)
    }
  }

  function migrate({ v, data }) {
    let current = data
    for (let from = v; from < version; from += 1) {
      const step = migrations[from]
      if (!step) throw new Error(`sem migration da versão ${from} para ${from + 1}`)
      current = step(current)
    }
    return current
  }

  // Procura a chave na versão atual e, se não houver, nas anteriores (para migrar)
  function findEntry(key) {
    for (let v = version; v >= 1; v -= 1) {
      const raw = safely((s) => s.getItem(keyFor(key, v)))
      if (raw !== null) return { raw, storedKey: keyFor(key, v) }
    }
    return null
  }

  return {
    get isPersistent() {
      return persistent
    },

    get(key, fallback = null) {
      const found = findEntry(key)
      if (!found) return fallback
      try {
        const entry = JSON.parse(found.raw)
        if (typeof entry !== 'object' || entry === null || typeof entry.v !== 'number') {
          throw new Error('formato inválido')
        }
        const data = migrate(entry)
        if (found.storedKey !== keyFor(key)) {
          safely((s) => s.removeItem(found.storedKey))
          safely((s) => s.setItem(keyFor(key), JSON.stringify({ v: version, data })))
        }
        return data
      } catch (error) {
        // Dado corrompido ou sem migration: descarta para não quebrar o jogo
        console.warn(`[storage] valor inválido em "${key}" foi descartado`, error)
        safely((s) => s.removeItem(found.storedKey))
        return fallback
      }
    },

    set(key, data) {
      safely((s) => s.setItem(keyFor(key), JSON.stringify({ v: version, data })))
    },

    remove(key) {
      safely((s) => s.removeItem(keyFor(key)))
    },
  }
}

export const storage = createStorage()
