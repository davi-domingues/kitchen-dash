import { beforeEach, describe, expect, it, vi } from 'vitest'

const DSN = 'https://public@o0.ingest.example.com/1'

async function loadModule() {
  vi.resetModules()
  return import('./monitoring.js')
}

function fakeSdk() {
  return { init: vi.fn(), captureException: vi.fn() }
}

describe('initMonitoring', () => {
  let monitoring

  beforeEach(async () => {
    monitoring = await loadModule()
  })

  it('não carrega o SDK sem DSN', async () => {
    const loadSdk = vi.fn()

    const started = await monitoring.initMonitoring({}, loadSdk)

    expect(started).toBe(false)
    expect(loadSdk).not.toHaveBeenCalled()
  })

  it('captureError é no-op sem inicialização', () => {
    expect(() => monitoring.captureError(new Error('x'))).not.toThrow()
  })

  it('inicia com sendDefaultPii false e sem integrações extras', async () => {
    const sdk = fakeSdk()

    await monitoring.initMonitoring(
      { VITE_SENTRY_DSN: DSN, VITE_SENTRY_ENVIRONMENT: 'test', VITE_SENTRY_RELEASE: '1.0.0' },
      async () => sdk,
    )

    const options = sdk.init.mock.calls[0][0]
    expect(options.sendDefaultPii).toBe(false)
    expect(options.integrations).toEqual([])
    expect(options).toMatchObject({ dsn: DSN, environment: 'test', release: '1.0.0' })
  })

  it('encaminha erros ao SDK depois de iniciar', async () => {
    const sdk = fakeSdk()
    await monitoring.initMonitoring({ VITE_SENTRY_DSN: DSN }, async () => sdk)
    const error = new Error('falha')

    monitoring.captureError(error, { scene: 'Kitchen' })

    expect(sdk.captureException).toHaveBeenCalledWith(error, { extra: { scene: 'Kitchen' } })
  })
})

describe('scrubPii', () => {
  it('remove e-mail, dados do usuário e cabeçalhos', async () => {
    const { scrubPii } = await loadModule()
    const event = {
      message: 'falhou para chef@example.com',
      user: { id: 'u1', email: 'chef@example.com', ip_address: '10.0.0.1' },
      request: { headers: { Authorization: 'x' }, cookies: 'sb=1' },
      extra: { nested: ['contato: chef@example.com'] },
    }

    const result = scrubPii(event)

    expect(result.message).toBe('falhou para [redacted]')
    expect(result.user).toEqual({ id: 'u1' })
    expect(result.request).toEqual({})
    expect(result.extra.nested[0]).toBe('contato: [redacted]')
  })

  it('descarta o usuário sem id', async () => {
    const { scrubPii } = await loadModule()

    const result = scrubPii({ user: { email: 'chef@example.com' } })

    expect(result.user).toBeUndefined()
  })
})
