import { describe, expect, it } from 'vitest'
import { NETWORK_ONLY_HOSTS, pwaOptions } from './pwaConfig.js'

const isNetworkOnly = (url) => NETWORK_ONLY_HOSTS.some((pattern) => pattern.test(url))

describe('pwaOptions', () => {
  it('espera o jogador aceitar a nova versão e não injeta script inline', () => {
    expect(pwaOptions.registerType).toBe('prompt')
    expect(pwaOptions.injectRegister).toBe(false)
  })

  it('manda Supabase, Sentry e Turnstile sempre para a rede', () => {
    expect(isNetworkOnly('https://abc.supabase.co/rest/v1/scores')).toBe(true)
    expect(isNetworkOnly('https://o1.ingest.us.sentry.io/api/1/envelope/')).toBe(true)
    expect(isNetworkOnly('https://challenges.cloudflare.com/turnstile/v0/api.js')).toBe(true)
    expect(pwaOptions.workbox.runtimeCaching.every((r) => r.handler === 'NetworkOnly')).toBe(true)
  })

  it('não trata o próprio site como network-only', () => {
    expect(isNetworkOnly('https://kitchen-dash.example.com/assets/index.js')).toBe(false)
  })

  it('cobre scripts, estilos, imagens e sons no precache e abre rotas internas offline', () => {
    const [pattern] = pwaOptions.workbox.globPatterns
    for (const ext of ['js', 'css', 'html', 'png', 'ogg', 'mp3']) expect(pattern).toContain(ext)
    expect(pwaOptions.workbox.navigateFallback).toBe('index.html')
  })
})
