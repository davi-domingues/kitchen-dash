# Research: Estado de envio ao ranking

## Desfecho por partida

- **Decision**: a rodada `run` da outbox inclui `outcomes: { [matchId]: 'sent' | 'discarded' | 'retrying' }` no resumo.
- **Rationale**: depois do envio a partida some da fila tanto se enviada quanto se descartada; sem o desfecho não dá para distinguir. Mantém os contadores existentes.
- **Alternatives**: guardar o status em `localStorage` (estado persistente sem necessidade); eventos/assinatura na outbox (mais código, sem ganho para uma tela).

## Mapeamento para o jogador

- **Decision**: `sent` → enviado; `discarded` → falhou; `retrying`, ausente na rodada (rodada concorrente, offline sem serviço, erro de autenticação) → pendente; exceção inesperada → falhou; sem usuário → visitante; sessão carregando → enviando.
- **Rationale**: SYSTEM_DESIGN §7.1: falhas transitórias são reenviadas, então para o jogador elas estão pendentes.

## Teste sem DOM

- **Decision**: lógica em funções puras testadas no Vitest (ambiente node); componente fica fino, verificado manualmente.
- **Alternatives**: jsdom + Testing Library (dependência só aprovada para o #70).
