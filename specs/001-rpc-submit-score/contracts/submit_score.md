# Contrato: `public.submit_score`

Chamada pelo app (KD-35) com `supabase.rpc('submit_score', { ... })`, só com sessão.

| Parâmetro | Tipo | Origem |
|---|---|---|
| `p_match_id` | uuid | `match:ended.matchId` |
| `p_board` | text (`^[a-z0-9_-]{1,40}$`) | React (ex.: `classic_1p`) |
| `p_score` | integer ≥ 0 | `score` |
| `p_duration_ms` | integer | `durationMs` |
| `p_seed` | bigint 0..4294967295 | `seed` |
| `p_content_version` | text | `contentVersion` |
| `p_origin` | `'online'` \| `'local'` | React |
| `p_orders_completed` | integer ≥ 0 | `ordersCompleted` |

Não enviados: `mode`, `players`, `ordersFailed`.

**Retorno** (`jsonb`): `{ "match_id": uuid, "is_new_best": bool, "best_score": int, "unlocked_cosmetics": [text] }`.
Reenvio da mesma partida pelo mesmo usuário devolve o estado atual com `unlocked_cosmetics: []`.

**Erros** (`error.code` / `error.message` no supabase-js):

| code | message | Ação do cliente |
|---|---|---|
| 28000 | `not_authenticated` | pedir login |
| 54000 | `rate_limited` | reenviar com backoff |
| 23505 | `match_conflict` | descartar |
| 22023 | `invalid_input`, `implausible_duration`, `implausible_score`, `unknown_content_version` | descartar |
| 42501 | (permission denied) | chamado como `anon` |
