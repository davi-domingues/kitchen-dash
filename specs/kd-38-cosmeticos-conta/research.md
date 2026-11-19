# Research — KD-38

- **Decisão**: equipado gravado só pela RPC `set_equipped(p_equipped jsonb)`; `update(equipped)` revogado de `authenticated`.
  **Motivo**: AGENTS §6 (escrita de cosméticos só por RPC) e pendência herdada da KD-31/34.
  **Alternativa**: trigger de validação no update — rejeitada, duas portas de escrita.
- **Decisão**: posse = item em `user_cosmetics` do usuário **ou** id fora de `game_rules.cosmetic_unlocks` (gratuito). Slots aceitos: `hat`, `apron`, `theme`; ids no formato `^[a-z0-9_]{1,40}$`.
  **Motivo**: o banco não guarda o catálogo; o cliente descarta id desconhecido ao sanear (KD-23).
- **Decisão**: no login a conta vence o equipado, slot a slot, se o item está liberado localmente; os ids da conta são unidos antes.
- **Decisão**: desbloqueios do `submit_score` entram pelo callback `onSubmitted` da outbox (services não importa features).
- **Decisão**: falha ao gravar na conta só gera `console.warn`; a escolha local fica (offline primeiro). Sem fila própria: o próximo equipar ou login reenvia o estado (KD-37 completa a migração).
