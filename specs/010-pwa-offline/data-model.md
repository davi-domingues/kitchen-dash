# Data Model

- **UpdateState** (memória, não persistido): `needRefresh`, `dismissed`. `needRefresh` vira `true` quando a versão nova fica em espera; `dismissed` só esconde o aviso; recarregar ativa a versão nova.
- Regra pura: `shouldShowUpdateNotice({ needRefresh, dismissed, pathname })` é `needRefresh && !dismissed && pathname` fora de `/jogar`.
