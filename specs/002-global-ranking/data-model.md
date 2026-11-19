# Modelo de dados: KD-36

## Dados lidos

| Entidade | Campos exibidos/consultados | Regra |
|---|---|---|
| Quadro `best_scores` | `board`, `user_id`, `score`, `achieved_at` | Um melhor recorde por usuário e quadro |
| Perfil público | `id`, `display_name` | Consultado em `public_profiles`; apenas nome público, sem e-mail nem `user_settings` |
| Quadro de ranking | `mode`, `players`, `board` | Exatamente 6 quadros: classic/free/challenge × 1p/2p |
| Página | índice de página, 20 posições, sinal de próxima página | Página é parte da chave de cache |
| Identidade atual | `user_id` da sessão, se houver | Usada apenas para realçar a própria linha presente na página |

## Regras

- `board` é formado pela modalidade e quantidade de jogadores: `classic_1p`, `classic_2p`, `free_1p`, `free_2p`, `challenge_1p`, `challenge_2p`.
- Todo quadro é ordenado por `score DESC`, depois `achieved_at ASC`, depois `user_id ASC`.
- O modo Desafio usa pontuação no ranking global conforme decisão de produto; o recorde local por tempo permanece separado e fora desta leitura.
- Cada página apresenta no máximo 20 posições.
- A resposta combina pontuação e nome público sem incluir campos pessoais.
- A linha própria é marcada somente se o `user_id` autenticado estiver entre as posições atuais; visitantes não recebem marcação.

## Estado de interface e cache

- Chave lógica: `[ranking, board, page]`.
- Freshness: 60 segundos.
- Estados distinguíveis: `initial-loading`, `success`, `empty`, `initial-offline/error`, `stale-cache/refetch-error`, `page-transition`.
- O cache é em memória; sobreviver a reload/offline sem consulta anterior não é requisito.
