# Research — KD-35

- **Backoff**: equal jitter, `espera = min(5 min, 2 s × 2^(n−1)) × (0,5 + 0,5 × rng())`. Evita rajadas sincronizadas sem zerar a espera. Alternativas: full jitter (pode reenviar imediatamente), sem jitter.
- **Teto**: 8 tentativas (~4 min acumulados). Depois descarta.
- **Classificação de erro**: `54000`, erro sem código (rede/TypeError), 5xx → transitório; `22023`, `23505` → permanente; `28000`, `42501` → sem sessão (para, mantém).
- **Fonte dos dados**: pendentes da KD-22; a fila só guarda `{ matchId, userId, attempts, nextAt }` para não duplicar o payload.
- **TanStack Query**: não usado. A fila já implementa retry persistente entre sessões; `useMutation` só retentaria em memória e duplicaria a lógica. Fica para leituras remotas (ranking, KD-36).
- **Board**: `<mode>_<players>p`.
