# Spec — KD-10 · Conteúdo do jogo em JSON com schema

Issue: #9 · Branch: `feat/kd-10-conteudo-json` · Referências: PRD (Receitas, Personalização), SYSTEM_DESIGN §3 e §4

## Histórias

1. **Como dev do core (KD-12/13)**, quero ler receitas, ingredientes e a cozinha de um módulo único, para não ter regra nem número hardcoded.
2. **Como time**, quero que o build falhe se um JSON de conteúdo estiver inválido, para nunca publicar conteúdo quebrado.
3. **Como backend (KD-31/35)**, quero um `content_version` estável em cada partida, para aceitar só versões conhecidas.

## Requisitos

- FR-1: `src/content/recipes.json` com as 4 receitas do protótipo (Salada, Tartine, Sopa de Tomate, Ratatouille): ingredientes, recipiente (prato ou panela), tempos de corte e cozimento, pontos e desbloqueio (0, 20, 45 e 70 s).
- FR-2: `src/content/kitchens.json` com o mapa do bistrô: grade, legenda de estações, spawns P1/P2 e tempo de queima do fogão.
- FR-3: `src/content/cosmetics.json` com chapéus, aventais e temas e os limiares do PRD.
- FR-4: um schema JSON por arquivo; o build falha se algum JSON violar o schema ou as regras de referência (ids únicos, ingredientes existentes, toda estação com chão adjacente, caixa para todo ingrediente, um item grátis por slot).
- FR-5: `CONTENT_VERSION` (hash) exportado pelo loader.
- FR-6: nomes visíveis só por i18n, chave `<tipo>.<id>.name`.

## Critérios de pronto

- Build falha com JSON inválido → `scripts/validate-content.test.js` + verificação manual (`npm run build` com um slot inválido).
- `CONTENT_VERSION` disponível → `src/content/content.test.js`.
- Toda chave de conteúdo existe no `pt-BR.json` → `src/i18n/i18n.test.js`.

## Suposições (clarify resolvido pelos docs, sem pergunta à pessoa)

- Pasta: `src/content/` (SYSTEM_DESIGN §3 coloca `content/` dentro de `src/`).
- Os tempos de corte (1,2–2 s), de cozimento (6–8 s) e de queima (6 s) não estão no PRD; são valores iniciais de balanceamento e mudam só no JSON.
- As cores dos cosméticos seguem os nomes do PRD; a arte final é da KD-19.
- Ingredientes ficam em `recipes.json` (a issue lista só 3 arquivos).
- `content_version` é calculado no cliente a partir dos JSON; a lista aceita no servidor é da KD-31.
