# Data model: Versão de conteúdo no CI

## Content version

- Derivada dos arquivos `recipes.json`, `kitchens.json` e `cosmetics.json`, nessa ordem.
- Formato: oito dígitos hexadecimais em minúsculas.

## Accepted versions migration

- A migration relevante é a mais recente, em ordem de nome de arquivo, que contém `accepted_content_versions`.
- Sua lista deve conter a versão derivada do conteúdo atual.
