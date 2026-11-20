# Data Model: QA final e release do MVP

Não há dados persistidos. Entidades documentais:

- **Item do checklist**: texto, origem (ARQUITETURA §9 ou escopo da issue), como verificar, estado (`[ ]` até verificado em produção → `[x]` com evidência na issue #39).
- **Entrada das notas**: KD/débito, PR, estado (mergeado | previsto).
- **Versão**: `X.Y.Z` (SemVer). Ciclo: versão no `package.json` por PR → merges → checklist completo → tag `vX.Y.Z` criada pela pessoa.
