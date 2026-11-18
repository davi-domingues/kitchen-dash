# Research: KD-23

- **Decision**: chave separada `kd:v1:cosmetics` = `{ bestScore, unlocked[], equipped{hat,apron,theme} }`.
  **Rationale**: não muda `kd:v1:progress` (KD-22/KD-35). O `bestScore` precisa ser guardado porque o placar do Desafio ordena por tempo e só mantém 10 por grupo, então não dá para recalcular o máximo a partir dele.
  **Alternatives**: campo novo em progress (exigiria migration e mexeria no sanitize da KD-22).
- **Decision**: regra = `getUnlockedCosmetics(bestScore)` da KD-10, idêntica a `cosmetic_unlocks` ≤ `max(best_scores.score)` da KD-31. A pontuação de qualquer partida concluída conta, inclusive Desafio incompleto, como no servidor, que grava todo score aceito.
- **Decision**: `unlocked` é cumulativo (união), assim a KD-38 une a lista da conta com `mergeUnlockedCosmetics(ids)`.
- **Decision**: cena recebe `{ hat, apron, theme }` em cores hex pelo registry (padrão KD-20).
