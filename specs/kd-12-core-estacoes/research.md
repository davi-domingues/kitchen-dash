# Research: KD-12

- **Decision**: panela fixa no fogão. **Rationale**: menos estados e menos ações no MVP; o PRD só
  pede "cozinham a panela; queimam e precisam ser limpos". **Alternatives**: panela carregável (pós-MVP).
- **Decision**: conteúdo injetado em `createStationsSystem({ recipes, ingredients, stoveBurnAfterMs })`.
  **Rationale**: core testável com conteúdo fictício e sem acoplar ao loader. **Alternatives**: importar `src/content`.
- **Decision**: a cena resolve a estação alvo e o "ficar parado"; o core expõe `canInteract`.
  **Rationale**: posição e direção são da cena (KD-18). **Alternatives**: grid no core (duplicaria colisão).
- **Decision**: entrega registrada em `state.deliveries` e evento `dish:served`.
  **Rationale**: sistemas só leem estado; KD-13 consome e limpa a lista. **Alternatives**: só evento (KD-13 não o veria).
- **Decision**: ingrediente incompatível com qualquer receita é recusado no prato e na panela.
- **Decision**: corte não acumula com dois chefs; avança `dtMs` uma vez por tábua.
