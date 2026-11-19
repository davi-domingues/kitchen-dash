# Pesquisa: KD-36

## Acesso e dados públicos

- **Decision**: Leitura pública sem login, buscando pontuações de `best_scores` e somente IDs/nomes públicos correspondentes de `public_profiles`. Nenhum e-mail, configuração privada ou cosmético é enviado.
- **Rationale**: O usuário confirmou o acesso público. O schema concede `SELECT` público a `best_scores`; políticas e grants permitem leitura de nome público. KD-36 não depende de login KD-33.
- **Alternatives considered**:
  - Exigir autenticação: conflita com a confirmação do usuário, com a leitura anônima configurada e adicionaria dependência da KD-33.
  - Expor histórico `scores`: rejeitado; ranking mostra o melhor recorde por jogador/quadro, não cada partida.
- **Documentation follow-up**: Corrigir em `docs/ARQUITETURA.md` a afirmação de que ranking exige autenticação e registrar a decisão em `docs/ESTUDOS_E_DECISOES.md`.
- **Own-row highlight**: Se houver sessão autenticada e a linha do usuário estiver na página carregada, destacar somente essa linha. A consulta permanece pública; a identidade não é enviada como filtro nem usada para alterar posições.

## Quadros e métrica

- **Decision**: Apresentar os seis quadros `{classic, free, challenge} × {1p, 2p}`; todos ordenados por pontuação decrescente.
- **Rationale**: A chave `board` aceita esses identificadores e a integração de envio os deriva de modo e jogadores. O usuário confirmou que Desafio entra por pontos, ainda que o melhor tempo continue sendo o objetivo local do modo.
- **Alternatives considered**:
  - Omitir Desafio por usar melhor tempo no modo local: rejeitado pela decisão explícita do usuário.
  - Alterar schema para ranquear Desafio por tempo: rejeitado; seria expansão de escopo e mudaria o contrato da tabela.
- **Documentation follow-up**: Alinhar `docs/PRD.md`/`docs/SYSTEM_DESIGN.md` se seus textos implicarem que o ranking global do Desafio usa tempo; registrar claramente a métrica de score no ranking.

## Paginação e cache

- **Decision**: `best_scores` filtrado por `board`, offset de 20 posições e ordem estável `score DESC`, `achieved_at ASC`, `user_id ASC`; buscar até 21 recordes para identificar a próxima página e nomes apenas para os 20 exibidos em `public_profiles`. Cache por `[ranking, board, page]`, `staleTime` de 60 segundos e dados anteriores indicados como provisórios durante transição.
- **Rationale**: A tabela tem chave primária `(board, user_id)` e índice `(board, score DESC, achieved_at)`. A ordenação final por ID evita mudanças arbitrárias no desempate. O limite e TTL atendem ao orçamento de egress em `SYSTEM_DESIGN.md` §9.
- **Alternatives considered**:
  - Busca não paginada: rejeitada por tamanho de resposta e custo de egress.
  - Persistir cache offline no navegador: rejeitado; não há requisito para persistência através de recarga e isso adicionaria sincronização/invalidação.
  - Cursor composto: possível, mas não necessário para um MVP com página de 20 e tamanho do banco atual; manter offset e verificar índice/performance.
- **Sources**: [Supabase select](https://supabase.com/docs/reference/javascript/select), [Supabase filters](https://supabase.com/docs/reference/javascript/using-filters), [Supabase order](https://supabase.com/docs/reference/javascript/order), [Supabase range](https://supabase.com/docs/reference/javascript/range), [TanStack Query paginated queries](https://tanstack.com/query/latest/docs/framework/react/guides/paginated-queries), [TanStack Query caching](https://tanstack.com/query/latest/docs/framework/react/guides/caching).

## Dependência de consultas

- **Decision**: Adicionar `@tanstack/react-query@5.108.0`, versão exata, e fornecer um `QueryClientProvider` estável no ponto de entrada React.
- **Rationale**: TanStack Query está aprovado em `SYSTEM_DESIGN.md` §11, mas ainda não está em `package.json`. O requisito da KD-36 depende do cache e estados da biblioteca.
- **Alternatives considered**: Implementar cache e stale-time manualmente: rejeitado por duplicar comportamento de cache/erro e fugir da decisão de arquitetura.
- **Constraint**: Atualizar lockfile no mesmo PR. Não adicionar plugin de persistência nem dependência de teste DOM.

## Testes e dependências entre tasks

- **Decision**: Cobrir seleção/erro/transformação de dados em Vitest com Supabase mockado; validar navegação, estados e acessibilidade manualmente até aprovação de ambiente DOM.
- **Rationale**: O repositório não possui `jsdom` ou `happy-dom`; issue de débito #70 registra que tal dependência requer aprovação. Evitar instalar ferramenta adicional na KD-36.
- **Execution dependency**: KD-21 (#20) e KD-30 (#24) foram confirmadas como concluídas; a implementação depende de manter os arquivos dessas entregas na branch atualizada.
