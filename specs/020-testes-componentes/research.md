# Research: Testes de componente

## Ambiente DOM

- **Decision**: happy-dom 21.0.4.
- **Rationale**: cobre DOM, eventos, foco e `<dialog>` usados pelas telas; instala e inicia mais rápido que o jsdom.
- **Alternatives**: jsdom (mais completo, mais pesado; reserva se faltar API).

## Seleção do ambiente

- **Decision**: diretiva `// @vitest-environment happy-dom` em cada `*.test.jsx`.
- **Rationale**: o Vitest 5 removeu `environmentMatchGlobs`; a diretiva mantém o core em Node sem config extra.
- **Alternatives**: `test.projects` com dois projetos (mais config, mesmo efeito).

## Isolamento de rede

- **Decision**: `vi.mock` no `rankingService.js` e no `useAccountMigration.js`; `AuthContext` fixo no helper.
- **Rationale**: nenhum teste toca Supabase (AGENTS §5).

## Fora do escopo do design

- Sem data-model nem contracts: a mudança só adiciona testes, sem entidades nem interfaces novas.
