# Contract: match:ended payload

**Event**: `match:ended`

**Producer**: Phaser (via EventBus)

**Consumers**: React app (tela de resultado, progresso local, envio futuro)

## Payload

Campos existentes:
- `matchId`
- `mode`
- `seed`
- `contentVersion`
- `score`
- `durationMs`

Campos adicionados para o desafio do dia:
- `dailyChallengeResult`
  - `dateUtc`: data de referencia (YYYY-MM-DD)
  - `challengeId`: id do desafio selecionado
  - `completed`: booleano

## Notes

- O resultado do desafio do dia e derivado do resumo da partida, sem chamadas de rede.
- A inclusao de `dailyChallengeResult` nao altera a semantica dos campos existentes.
