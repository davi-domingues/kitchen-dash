# Research: Migração pós-login

- **Decision**: derivar "pendente" do estado local (partidas de visitante no `pending`) em vez de um campo novo no marcador.
  - **Rationale**: o `pending` já é a fonte da verdade, e a remoção por matchId após a resposta definitiva garante a idempotência.
  - **Alternatives**: versão nova do marcador (exige migrar dado); enviar ao fim de cada partida de visitante (visitante não envia, ARQUITETURA §5.1).
- **Decision**: reabrir `scores` e `cosmetics`, não `settings`.
  - **Rationale**: os cosméticos dependem das partidas revalidadas; as configurações já foram conciliadas.
