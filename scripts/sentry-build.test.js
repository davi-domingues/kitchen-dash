import { describe, expect, it } from 'vitest'
import { sentryPluginOptions, sentryRelease } from './sentry-build.js'

describe('sentryRelease', () => {
  it('usa o SHA da Cloudflare Pages', () => {
    expect(sentryRelease({ CF_PAGES_COMMIT_SHA: 'abc123', GITHUB_SHA: 'def456' })).toBe('abc123')
  })

  it('cai para o SHA do GitHub Actions', () => {
    expect(sentryRelease({ GITHUB_SHA: 'def456' })).toBe('def456')
  })

  it('respeita VITE_SENTRY_RELEASE explícito', () => {
    expect(sentryRelease({ VITE_SENTRY_RELEASE: 'v1', CF_PAGES_COMMIT_SHA: 'abc123' })).toBe('v1')
  })

  it('fica indefinida em build local', () => {
    expect(sentryRelease({})).toBeUndefined()
  })
})

describe('sentryPluginOptions', () => {
  it('desliga o upload sem token', () => {
    expect(sentryPluginOptions({ CF_PAGES_COMMIT_SHA: 'abc123' })).toBeNull()
  })

  it('envia para a release do commit e apaga os mapas do dist', () => {
    const options = sentryPluginOptions({
      SENTRY_AUTH_TOKEN: 'token-ficticio',
      SENTRY_ORG: 'org-exemplo',
      SENTRY_PROJECT: 'projeto-exemplo',
      CF_PAGES_COMMIT_SHA: 'abc123',
    })

    expect(options).toMatchObject({
      org: 'org-exemplo',
      project: 'projeto-exemplo',
      release: { name: 'abc123' },
      sourcemaps: { filesToDeleteAfterUpload: ['./dist/**/*.map'] },
    })
  })
})
