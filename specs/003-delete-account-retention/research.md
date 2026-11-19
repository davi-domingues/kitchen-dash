# Research: Exclusão de conta e retenção

## Decision: Excluir a identidade em `auth.users`

- **Rationale**: As tabelas de perfil e progresso possuem chaves estrangeiras com `on delete cascade` originadas da identidade. Excluir a identidade remove a conta e todos os dados vinculados em uma transação.
- **Alternatives considered**: Excluir manualmente cada tabela pública foi rejeitado porque deixa o dado de autenticação e eleva o risco de esquecer uma relação futura.

## Decision: RPC privilegiada e autenticada

- **Rationale**: A identidade de autenticação não pode ser removida por escrita direta do cliente. A RPC valida o usuário autenticado antes de excluir somente a linha cujo identificador coincide com a sessão.
- **Alternatives considered**: Conceder exclusão direta a `authenticated` foi rejeitado porque permitiria ampliar a superfície de exclusão fora do contrato da aplicação.

## Decision: Limpeza diária às 03:00 UTC

- **Rationale**: É a agenda aprovada para aplicar a retenção de 90 dias de forma previsível, usando o índice temporal já definido para `scores`.
- **Alternatives considered**: Limpeza a cada hora aumenta execuções sem benefício para uma retenção de 90 dias; limpeza semanal prolonga materialmente a retenção efetiva.

## Decision: Preservar recordes e estatísticas durante a retenção

- **Rationale**: O produto distingue histórico expirável de progresso permanente. `best_scores.match_id` não possui chave estrangeira justamente para sobreviver à expiração do histórico.
- **Alternatives considered**: Apagar recordes ligados a partidas expiradas foi rejeitado por perder progresso ativo e contradizer a decisão D6/D7.
