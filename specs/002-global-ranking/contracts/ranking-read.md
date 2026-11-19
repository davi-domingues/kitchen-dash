# Contrato: leitura do ranking

## Entrada

```text
board: um de classic_1p, classic_2p, free_1p, free_2p, challenge_1p, challenge_2p
page: inteiro >= 0
pageSize: 20 (fixo no MVP)
```

## Saída

```text
{
  entries: [{ userId, displayName, score, achievedAt, position }],
  hasNextPage: boolean
}
```

- `entries` contém no máximo 20 registros do quadro solicitado.
- O serviço pode ler até 21 recordes para determinar `hasNextPage`, mas só retorna e busca nomes públicos para os 20 primeiros.
- `position` é global no quadro, baseada na ordenação e no índice da página.
- Ordem: `score DESC`, `achieved_at ASC`, `user_id ASC`.
- `hasNextPage` é falso quando não há registro posterior.
- Não há escrita, RPC ou autenticação obrigatória.
- Campos privados nunca fazem parte da resposta.
- A leitura combina `best_scores` com `public_profiles`; a identidade autenticada atual é opcional e serve somente para marcar um registro presente na página.
- Um registro só é destacado como próprio quando seu `userId` coincide com o usuário autenticado. Não destacar uma linha quando a identidade não estiver presente na página.

## Estados para o consumidor

- Dados: atualizar quando a consulta concluir com sucesso.
- Vazio: sucesso com `entries` vazio.
- Erro inicial: rejeitar consulta e apresentar indisponibilidade/retry, nunca sucesso vazio.
- Erro de atualização com dados: preservar a página anterior disponível e indicar que está desatualizada.
- Troca de página: dados anteriores podem permanecer visíveis enquanto a próxima consulta está pendente, mas a interface identifica a atualização e não habilita navegação baseada em resultado provisório.
