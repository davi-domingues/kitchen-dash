# Research: Reenvio do equipado

- **Decision**: fila nova de um item por usuário, reaproveitando `backoffDelay` e as constantes de `scoreOutbox.js`.
  - **Rationale**: o equipado é estado (o último vence), não evento; a outbox de pontuação guarda um item por partida e lê o payload do `pending`, então não serve direto. Reaproveitar o cálculo evita duplicação.
  - **Alternatives**: generalizar `createScoreOutbox` (mexe numa peça crítica da KD-35 sem ganho); guardar o payload na fila (duplica o estado local e pode enviar uma escolha velha).
- **Decision**: não diferenciar tipos de falha.
  - **Rationale**: `CosmeticsFailure` não classifica códigos e o teto de 8 tentativas limita o custo de uma recusa definitiva.
- **Decision**: no login, reenviar antes de ler a conta e pular a leitura se a pendência continuar.
  - **Rationale**: `applyAccountCosmetics` restaura o equipado da conta e reverteria a escolha não enviada.
