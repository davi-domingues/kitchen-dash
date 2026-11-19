# Implementation Plan: Ranking global paginado

**Branch**: `feat/kd-36-global-ranking` | **Date**: 2026-11-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification for KD-36.

## Summary

Substituir a página placeholder de ranking por uma consulta pública de recordes por modo e número de jogadores. Cada quadro mostra até 20 nomes e pontuações, ordenados deterministicamente. A consulta usa cache remoto de 60 s e mantém um estado explícito para primeira carga, vazio, falha/offline e dados antigos em cache. A KD-36 mostra pontuação em todos os modos, inclusive Desafio, conforme clarificação; não altera a validação de pontuações nem a lógica de `best_scores`.

## Technical Context

**Language/Version**: JavaScript ESM; React 19; Node.js >=24  
**Primary Dependencies**: React Router 8, Supabase JS 2.119.0, TanStack Query `@tanstack/react-query@5.108.0` (pacote aprovado, ainda ausente do `package.json`)  
**Storage**: `public.best_scores` e perfis públicos; cache em memória do cliente de consultas  
**Testing**: Vitest com mocks para serviços e query helpers; teste manual dos estados da tela, pois não há ambiente DOM aprovado no repositório  
**Target Platform**: Aplicação web desktop; rota `/ranking`; leitura pública pela Data API  
**Project Type**: Aplicação web React/Vite  
**Performance Goals**: Páginas de 20 posições; `staleTime` de 60 s; selecionar só campos necessários  
**Constraints**: Sem login obrigatório; sem PII; query keys incluem quadro e página; textos via i18n; navegação por teclado; não adicionar pacote de testes DOM sem aprovação  
**Scale/Scope**: 6 quadros (3 modos × 1/2 jogadores); leitura de recordes existentes; destaque da própria linha quando visível; sem alterações no banco

## Constitution Check

- **I — Offline**: Passa. A falha de ranking é informativa e não impede partida; exibir cache em memória disponível, nunca apresentar erro como lista vazia.
- **II — Cliente não confiável**: Passa. A feature só lê `best_scores`; nenhuma escrita ou cálculo de autoridade fica no cliente. RLS existente é mantida.
- **IV — Conteúdo/i18n**: Passa. Toda cópia visível é traduzida; modo e número de jogadores vêm de opções explícitas.
- **V — Fornecedores atrás de interfaces**: Passa. Supabase é acessado por serviço de `features/ranking`, não pelo componente.
- **VI — Custo e tamanho**: Passa. Uma página de 20 itens, cache de 60 s e colunas mínimas seguem o System Design; adicionar apenas dependência aprovada.
- **Dependências**: `@tanstack/react-query` já consta na lista aprovada do `SYSTEM_DESIGN.md` §11, mas ainda não está no `package.json`. Fixar a versão exata `5.108.0` e atualizar lockfile no mesmo PR.
- **Documentação**: A decisão de ranking público e ranking por pontuação também no Desafio diverge de textos atuais de arquitetura/produto; atualizar `docs/ARQUITETURA.md`, `docs/PRD.md` se necessário e registrar justificativa em `docs/ESTUDOS_E_DECISOES.md` no mesmo PR.

## Research Summary

Decisões e referências oficiais em [research.md](./research.md). Consulta em páginas por offset com ordem estável; a chave de consulta inclui board/página, cache é stale após 60 s, e resultados anteriores são mantidos durante a troca de página com indicação de atualização.

## Project Structure

### Documentation (this feature)

```text
specs/002-global-ranking/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    └── ranking-read.md
```

### Source Code

```text
src/
├── app/
│   └── RankingPage.jsx
├── main.jsx
├── features/ranking/
│   ├── rankingService.js
│   ├── rankingQueries.js
│   ├── RankingPageContent.jsx
│   └── rankingService.test.js
├── i18n/pt-BR.json
└── index.css
```

**Structure Decision**: Manter rota e shell em `src/app`, lógica de leitura e query keys em `src/features/ranking`, dependência e provider na raiz do React e todas as mensagens na tradução existente. Não criar RPC, migration ou persistência local.

## Implementation Sequence

1. Adicionar `@tanstack/react-query@5.108.0` com versão exata e atualizar `package-lock.json`; instalar o `QueryClientProvider` na raiz sem recriar o cliente a cada render.
2. Criar serviço de leitura em `src/features/ranking/rankingService.js`: validar o quadro permitido, buscar `board`, `user_id`, `score` e `achieved_at` em `best_scores`, buscar `id` e `display_name` dos IDs exibidos em `public_profiles` e propagar erros do Supabase sem retornar lista vazia como fallback.
3. Implementar quadro explícito para `classic_1p`, `classic_2p`, `free_1p`, `free_2p`, `challenge_1p` e `challenge_2p`. Todas as modalidades ordenam pontuação decrescente, conforme decisão do usuário.
4. Implementar paginação de 20 linhas com ordenação estável (`score DESC`, `achieved_at ASC`, `user_id ASC`); buscar até 21 recordes para determinar `hasNextPage` e exibir somente os primeiros 20. Incluir ações de página anterior/próxima e estado de atualização quando a página anterior ainda está visível.
5. Configurar query key por quadro e página, `staleTime: 60_000`, e manter dados anteriores somente enquanto a próxima página está pendente. Uma falha deve preservar dados antigos disponíveis e identificá-los como desatualizados.
6. Completar estados de carregamento, vazio, offline inicial, erro, cache desatualizado e retry. Realçar a própria linha apenas para sessão autenticada quando estiver nos resultados visíveis. Usar i18n e semântica acessível para anúncios da página/resultados.
7. Testar serviço/query helper em Vitest com client mockado; validar manualmente a interface e teclado, sem adicionar `jsdom`, `happy-dom` ou E2E.
8. Atualizar documentação do produto/arquitetura para registrar acesso público, escolha de score no Desafio e destaque limitado à linha visível; validar gates e orçamento do build.

## Validation Plan

- `npm test`
- `npm run lint`
- `npm run format:check`
- `npm run build`
- `npm run check-size`
- Verificação manual em `/ranking`: os 6 quadros, página vazia, avanço/retorno, empate estável, navegação por teclado, primeira visita offline, falha com cache e recuperação por retry.
- Não executar teste contra Supabase remoto; usar mocks para testes de serviço e banco local apenas se fixtures de ranking forem necessárias.

## Constitution Check (Post-Design)

- Nenhuma gravação de ranking é adicionada ao cliente.
- O acesso público utiliza somente os dados já definidos como públicos pelo schema; nomes são os únicos dados de perfil necessários.
- A dependência query permanece dentro da lista aprovada, pinada exatamente e com lockfile.
- Não há persistência adicional em `localStorage`, extensão de cache persistente ou ambiente DOM de teste.
- A consulta ao backend aguarda a conclusão da KD-30 e a composição/rota base aguarda a KD-21; planejar não remove essas dependências de execução.

## Complexity Tracking

Sem violações ou abstrações adicionais.
