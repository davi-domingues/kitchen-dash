import { describe, expect, it, vi } from 'vitest'
import { FAILURE_KINDS, ScoreFailure } from '../../services/scoreFailure.js'
import { loadSettings } from '../../services/settings.js'
import { createStorage } from '../../services/storage.js'
import { equipCosmeticP2, loadCosmetics, recordScore } from '../cosmetics/cosmeticsStore.js'
import { loadProgress, recordMatchResult } from '../progress/progressStore.js'
import {
  BATCH_SIZE,
  WINDOW_MS,
  isMigrationDone,
  listGuestEntries,
  runAccountMigration,
} from './accountMigration.js'

const USER = { id: 'user-a', email: 'chef@example.com' }
const NOW = new Date('2026-11-18T12:00:00Z')

function memoryStore() {
  const map = new Map()
  return createStorage({
    backend: {
      getItem: (k) => (map.has(k) ? map.get(k) : null),
      setItem: (k, v) => map.set(k, String(v)),
      removeItem: (k) => map.delete(k),
    },
  })
}

function matchId(n) {
  return `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`
}

function playGuestMatches(store, count, first = 1) {
  for (let n = first; n < first + count; n += 1) {
    recordMatchResult(
      {
        matchId: matchId(n),
        mode: 'classic',
        players: 1,
        seed: n,
        contentVersion: '7691008a',
        score: 100 + n,
        ordersCompleted: 1,
        ordersFailed: 0,
        durationMs: 180000,
      },
      { store, now: NOW },
    )
  }
}

// Todas as dependências remotas falsas, sem rede; sobrescreva só o que o teste exercita
function setup({ store = memoryStore(), submitScore, account = {}, ...rest } = {}) {
  const settingsService = {
    fetchSettings: vi.fn(async () => account),
    saveSettings: vi.fn(async () => null),
  }
  const deps = {
    store,
    loadScoreService: async () => ({ submitScore: submitScore ?? vi.fn(async () => ({})) }),
    loadSettingsService: async () => settingsService,
    pullCosmetics: vi.fn(async () => ({})),
    pushEquipped: vi.fn(async () => true),
    sleep: vi.fn(async () => {}),
    rng: () => 0.5,
    ...rest,
  }
  return { store, deps, settingsService }
}

describe('runAccountMigration: partidas de visitante', () => {
  it('envia cada partida com origin local e limpa o pendente', async () => {
    const { store, deps } = setup()
    playGuestMatches(store, 3)

    const result = await runAccountMigration(USER, deps)

    expect(result).toEqual({ status: 'done', sent: 3, discarded: 0 })
    expect(loadProgress(store).pending).toEqual([])
    expect(isMigrationDone(USER.id, store)).toBe(true)
  })

  it('usa origin local no submit_score', async () => {
    const submitScore = vi.fn(async () => ({}))
    const { store, deps } = setup({ submitScore })
    playGuestMatches(store, 1)

    await runAccountMigration(USER, deps)

    expect(submitScore).toHaveBeenCalledWith(expect.objectContaining({ matchId: matchId(1) }), {
      origin: 'local',
    })
  })

  it('não envia partidas que estão na outbox de uma conta', () => {
    const store = memoryStore()
    playGuestMatches(store, 2)
    store.set('outbox', { items: [{ matchId: matchId(1), userId: 'outro', attempts: 0, nextAt: 0 }] })

    expect(listGuestEntries(store).map((e) => e.matchId)).toEqual([matchId(2)])
  })

  it('espera a janela de 60 s a cada lote de 10 envios', async () => {
    const { store, deps } = setup()
    playGuestMatches(store, 25)

    await runAccountMigration(USER, deps)

    expect(deps.sleep).toHaveBeenCalledTimes(2)
    expect(deps.sleep).toHaveBeenCalledWith(WINDOW_MS)
    expect(BATCH_SIZE).toBe(10)
  })

  it('erro de limite é reenviado com backoff', async () => {
    const submitScore = vi
      .fn()
      .mockRejectedValueOnce(new ScoreFailure(FAILURE_KINDS.RETRY))
      .mockResolvedValue({})
    const { store, deps } = setup({ submitScore })
    playGuestMatches(store, 1)

    const result = await runAccountMigration(USER, deps)

    expect(submitScore).toHaveBeenCalledTimes(2)
    expect(deps.sleep).toHaveBeenCalledTimes(1)
    expect(result.status).toBe('done')
  })

  it('descarta a partida recusada e segue com as outras', async () => {
    const submitScore = vi
      .fn()
      .mockRejectedValueOnce(new ScoreFailure(FAILURE_KINDS.DISCARD))
      .mockResolvedValue({})
    const { store, deps } = setup({ submitScore })
    playGuestMatches(store, 2)

    const result = await runAccountMigration(USER, deps)

    expect(result).toEqual({ status: 'done', sent: 1, discarded: 1 })
    expect(loadProgress(store).pending).toEqual([])
  })

  it('retries esgotados deixam a migração parcial e retomável sem duplicar', async () => {
    const submitScore = vi
      .fn()
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new ScoreFailure(FAILURE_KINDS.RETRY))
      .mockRejectedValueOnce(new ScoreFailure(FAILURE_KINDS.RETRY))
      .mockRejectedValueOnce(new ScoreFailure(FAILURE_KINDS.RETRY))
      .mockResolvedValue({})
    const { store, deps } = setup({ submitScore })
    playGuestMatches(store, 2)

    const first = await runAccountMigration(USER, deps)
    const second = await runAccountMigration(USER, deps)

    expect(first).toEqual({ status: 'partial', sent: 1, discarded: 0 })
    expect(second).toEqual({ status: 'done', sent: 2, discarded: 0 })
    const sentIds = submitScore.mock.calls.map(([entry]) => entry.matchId)
    expect(sentIds.filter((id) => id === matchId(1))).toHaveLength(1)
  })

  it('sessão inválida interrompe sem tentar de novo', async () => {
    const submitScore = vi.fn().mockRejectedValue(new ScoreFailure(FAILURE_KINDS.AUTH))
    const { store, deps } = setup({ submitScore })
    playGuestMatches(store, 2)

    const result = await runAccountMigration(USER, deps)

    expect(result.status).toBe('partial')
    expect(submitScore).toHaveBeenCalledTimes(1)
    expect(loadProgress(store).pending).toHaveLength(2)
  })

  it('aplica os cosméticos liberados pelo servidor', async () => {
    const submitScore = vi.fn(async () => ({ unlockedCosmetics: ['hat_navy'] }))
    const { store, deps } = setup({ submitScore })
    playGuestMatches(store, 1)

    await runAccountMigration(USER, deps)

    expect(loadCosmetics(store).unlocked).toContain('hat_navy')
  })

  it('informa o progresso', async () => {
    const onProgress = vi.fn()
    const { store, deps } = setup({ onProgress })
    playGuestMatches(store, 2)

    await runAccountMigration(USER, deps)

    expect(onProgress).toHaveBeenLastCalledWith({ phase: 'scores', done: 2, total: 2 })
  })

  it('sem backend não faz nada nem marca etapa', async () => {
    const { store, deps } = setup({ loadScoreService: async () => null })
    playGuestMatches(store, 1)

    const result = await runAccountMigration(USER, deps)

    expect(result.status).toBe('partial')
    expect(loadProgress(store).pending).toHaveLength(1)
    expect(isMigrationDone(USER.id, store)).toBe(false)
  })

  it('sem usuário é ignorada', async () => {
    const { deps } = setup()

    expect((await runAccountMigration(null, deps)).status).toBe('skipped')
  })
})

describe('runAccountMigration: cosméticos e configurações', () => {
  it('lê os cosméticos da conta e grava o equipado', async () => {
    const { deps } = setup()

    await runAccountMigration(USER, deps)

    expect(deps.pullCosmetics).toHaveBeenCalledWith(USER.id)
    expect(deps.pushEquipped).toHaveBeenCalledWith(USER)
  })

  it('não sobe o cosmético do P2, que continua no navegador', async () => {
    const { store, deps } = setup()
    recordScore(320, store)
    equipCosmeticP2('hat_bordeaux', store)
    const cosmeticsService = {
      fetchAccountCosmetics: vi.fn(async () => ({ unlocked: [], equipped: {} })),
      saveEquipped: vi.fn(async () => null),
    }
    // Usa o pull/push reais da KD-38 sobre um serviço falso
    delete deps.pullCosmetics
    delete deps.pushEquipped

    await runAccountMigration(USER, { ...deps, loadCosmeticsService: async () => cosmeticsService })

    expect(cosmeticsService.saveEquipped).toHaveBeenCalledWith({
      hat: 'hat_classic',
      apron: 'apron_cream',
      theme: 'theme_bistro',
    })
    expect(loadCosmetics(store).equippedP2.hat).toBe('hat_bordeaux')
  })

  it('falha nos cosméticos não marca a etapa e não segue para as configurações', async () => {
    const { store, deps, settingsService } = setup({ pullCosmetics: vi.fn(async () => null) })

    const result = await runAccountMigration(USER, deps)

    expect(result.status).toBe('partial')
    expect(settingsService.fetchSettings).not.toHaveBeenCalled()
    expect(isMigrationDone(USER.id, store)).toBe(false)
  })

  it('conta sem teclas recebe as teclas locais', async () => {
    const { store, deps, settingsService } = setup()
    store.set('settings', { keyBindings: { pause: 'KeyP' } })

    await runAccountMigration(USER, deps)

    expect(settingsService.saveSettings).toHaveBeenCalledWith(USER.id, { keyBindings: { pause: 'KeyP' } })
  })

  it('conta com teclas vence e o local passa a refletir a conta', async () => {
    const { store, deps, settingsService } = setup({ account: { keyBindings: { pause: 'KeyO' } } })
    store.set('settings', { keyBindings: { pause: 'KeyP' } })

    await runAccountMigration(USER, deps)

    expect(settingsService.saveSettings).not.toHaveBeenCalled()
    expect(loadSettings(store)).toEqual({ keyBindings: { pause: 'KeyO' } })
  })

  it('falha nas configurações mantém o local intacto', async () => {
    const { store, deps, settingsService } = setup()
    settingsService.fetchSettings.mockRejectedValue(new Error('offline'))
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    store.set('settings', { keyBindings: { pause: 'KeyP' } })

    const result = await runAccountMigration(USER, deps)

    expect(result.status).toBe('partial')
    expect(loadSettings(store)).toEqual({ keyBindings: { pause: 'KeyP' } })
  })

  it('concluída, não roda de novo para o mesmo usuário', async () => {
    const { deps } = setup()
    await runAccountMigration(USER, deps)

    const again = await runAccountMigration(USER, deps)

    expect(again.status).toBe('skipped')
    expect(deps.pullCosmetics).toHaveBeenCalledTimes(1)
  })

  // Regressão #73: partidas de visitante jogadas depois da migração ficavam presas no local
  it('migra no próximo login as partidas de visitante jogadas após a conclusão', async () => {
    const submitScore = vi.fn(async () => ({}))
    const { store, deps, settingsService } = setup({ submitScore })
    playGuestMatches(store, 1)
    await runAccountMigration(USER, deps)
    playGuestMatches(store, 2, 10)

    expect(isMigrationDone(USER.id, store)).toBe(false)
    const again = await runAccountMigration(USER, deps)

    expect(again).toEqual({ status: 'done', sent: 2, discarded: 0 })
    expect(submitScore.mock.calls.map(([entry]) => entry.matchId)).toEqual([
      matchId(1),
      matchId(10),
      matchId(11),
    ])
    expect(loadProgress(store).pending).toEqual([])
    expect(deps.pullCosmetics).toHaveBeenCalledTimes(2)
    expect(settingsService.fetchSettings).toHaveBeenCalledTimes(1)
    expect(isMigrationDone(USER.id, store)).toBe(true)
  })

  it('rodada pós-login interrompida retoma sem reenviar', async () => {
    const { store, deps } = setup()
    await runAccountMigration(USER, deps)
    playGuestMatches(store, 2, 10)
    const submitScore = vi
      .fn()
      .mockResolvedValueOnce({})
      .mockRejectedValue(new ScoreFailure(FAILURE_KINDS.AUTH))
    await runAccountMigration(USER, { ...deps, loadScoreService: async () => ({ submitScore }) })

    const retry = vi.fn(async () => ({}))
    const result = await runAccountMigration(USER, {
      ...deps,
      loadScoreService: async () => ({ submitScore: retry }),
    })

    expect(result.status).toBe('done')
    expect(retry.mock.calls.map(([entry]) => entry.matchId)).toEqual([matchId(11)])
  })

  it('o marcador é por usuário', async () => {
    const { store, deps } = setup()
    await runAccountMigration(USER, deps)

    expect(isMigrationDone('user-b', store)).toBe(false)
  })
})
