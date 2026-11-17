import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import ptBR from './pt-BR.json'

// Instância única do app: o React usa via useTranslation() e as cenas do Phaser importam `t` daqui.
// Convenção de chaves (AGENTS.md §5): <área>.<tela ou componente>.<texto>, em camelCase.
// Conteúdo do jogo segue <tipo>.<id>.<campo>, ex.: recipes.ratatouille.name
export const i18n = i18next.createInstance()

i18n.use(initReactI18next).init({
  lng: 'pt-BR',
  fallbackLng: 'pt-BR',
  supportedLngs: ['pt-BR'],
  resources: { 'pt-BR': { translation: ptBR } },
  interpolation: { escapeValue: false }, // o React já escapa
  returnNull: false,
  initAsync: false,
})

export const t = i18n.t.bind(i18n)
