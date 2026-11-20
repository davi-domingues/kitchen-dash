import { describe, expect, it } from 'vitest'
import ptBR from '../i18n/pt-BR.json'

const SECTIONS = ['collected', 'purpose', 'retention', 'sharing', 'storage', 'rights', 'contact']

describe('política de privacidade', () => {
  it('tem as 7 seções exigidas pela KD-44', () => {
    for (const section of SECTIONS) expect(ptBR.privacy[section].title).toBeTruthy()
  })

  it('cita os dados pessoais coletados e a retenção de 90 dias', () => {
    expect(ptBR.privacy.collected.body).toMatch(/e-mail/)
    expect(ptBR.privacy.collected.body).toMatch(/nome de exibição/)
    expect(ptBR.privacy.retention.body).toMatch(/90 dias/)
  })

  it('não inventa controlador nem encarregado: ficam marcados para revisão', () => {
    expect(ptBR.privacy.contact.controller).toContain('[a definir]')
    expect(ptBR.privacy.contact.dpo).toContain('[a definir]')
  })
})
