# Implementation Plan: Testes de componente das telas principais

**Branch**: `test/debito-70-testes-componentes` | **Spec**: [spec.md](spec.md)

## Summary

Adicionar `happy-dom` e `@testing-library/react@16.3.3` como devDependencies exatas e escrever testes `*.test.jsx` ao lado de cada tela. Cada arquivo declara `// @vitest-environment happy-dom`; o resto da suíte continua em Node.

## Technical Context

- JS/ESM, React 19, Vitest 5, i18next (pt-BR real carregado por `src/i18n/index.js`).
- Roteamento: `MemoryRouter` do `react-router`.
- Remoto: `QueryClient` de teste com `retry: false`; os módulos de serviço do placar são substituídos por `vi.mock`.
- Auth: `AuthContext` com valor fixo (`status: 'disabled'` ou usuário fictício `@example.com`).
- Armazenamento: `localStorage` do happy-dom, limpo em `beforeEach`.

## Constitution Check

- Core intocado e continua em Node (§4). Sem rede/Supabase (§5 Testes). Dependências aprovadas pelo débito #70, com versão exata (§7). Decisão em ESTUDOS_E_DECISOES. Sem impacto no bundle.

## Artefatos

[research.md](research.md) e [quickstart.md](quickstart.md). Sem data-model nem contracts (só testes).

## Structure

```
src/test/renderWithProviders.jsx   # helper: i18n + router + query + auth
src/app/HomePage.test.jsx
src/app/ProfilePage.test.jsx
src/app/SettingsPage.test.jsx
src/features/match/MatchResult.test.jsx
src/features/ranking/RankingPageContent.test.jsx
src/features/migration/MigrationNotice.test.jsx
```

O cleanup do Testing Library é registrado no helper (`afterEach(cleanup)`), pois a suíte não usa `globals`.
