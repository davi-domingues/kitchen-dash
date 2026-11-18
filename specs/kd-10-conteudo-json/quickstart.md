# Quickstart — validar a KD-10

Pré-requisito: `npm ci`.

1. `npm test`: `validate-content.test.js` cobre cada regra; `content.test.js` cobre o loader e o `CONTENT_VERSION`; `i18n.test.js` cobre os nomes de conteúdo.
2. `npm run build` deve passar com o conteúdo atual.
3. **Falha esperada:** troque um `"slot": "hat"` por `"slot": "shoe"` em `src/content/cosmetics.json` e rode `npm run build`. O build deve falhar com `Conteúdo inválido: cosmetics.json/cosmetics/N/slot: must be equal to one of the allowed values`. Desfaça a troca depois.
4. `npm run dev` com o mesmo erro também deve falhar ao iniciar.
