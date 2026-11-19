import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const HEADERS_FILE = new URL('../../public/_headers', import.meta.url)

function parseHeaders(text) {
  const rules = {}
  let current = null
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue
    if (!/^\s/.test(line)) {
      current = line.trim()
      rules[current] = {}
      continue
    }
    const separator = line.indexOf(':')
    rules[current][line.slice(0, separator).trim().toLowerCase()] = line.slice(separator + 1).trim()
  }
  return rules
}

function parseCsp(value) {
  return Object.fromEntries(
    value
      .split(';')
      .map((directive) => directive.trim().split(/\s+/))
      .filter(([name]) => name)
      .map(([name, ...sources]) => [name, sources]),
  )
}

describe('public/_headers', () => {
  const rules = parseHeaders(readFileSync(HEADERS_FILE, 'utf8'))
  const csp = parseCsp(rules['/*']['content-security-policy'])

  it('restringe a CSP sem unsafe-eval nem unsafe-inline em scripts', () => {
    expect(rules['/*']['content-security-policy']).not.toContain('unsafe-eval')
    expect(csp['script-src']).not.toContain("'unsafe-inline'")
    expect(csp['default-src']).toEqual(["'self'"])
    expect(csp['object-src']).toEqual(["'none'"])
    expect(csp['frame-ancestors']).toEqual(["'none'"])
  })

  it('libera conexões para Supabase, Sentry e Turnstile', () => {
    expect(csp['connect-src']).toEqual(
      expect.arrayContaining([
        'https://*.supabase.co',
        'wss://*.supabase.co',
        'https://*.ingest.sentry.io',
        'https://*.ingest.us.sentry.io',
        'https://challenges.cloudflare.com',
      ]),
    )
  })

  it('envia os demais cabeçalhos de segurança', () => {
    expect(rules['/*']).toMatchObject({
      'x-frame-options': 'DENY',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'strict-origin-when-cross-origin',
    })
    expect(rules['/*']['permissions-policy']).toContain('camera=()')
  })

  it('aplica cache longo e imutável aos assets com hash', () => {
    expect(rules['/assets/*']['cache-control']).toBe('public, max-age=31536000, immutable')
  })
})
