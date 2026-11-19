# Implementation Plan: Versão de conteúdo no CI

**Branch**: `ci/kd-56-versao-conteudo` | **Date**: 2026-11-19 | **Spec**: [spec.md](spec.md)

## Summary

Criar um script Node determinístico que reproduz o hash FNV-1a de `src/content/index.js`, localiza a última migration que atualiza `accepted_content_versions` e falha caso essa lista não inclua a versão atual. O workflow de qualidade o executa depois da instalação das dependências.

## Technical Context

- **Language/Version**: JavaScript ESM, Node 24
- **Dependencies**: somente módulos internos de Node; sem dependência nova
- **Testing**: Vitest com fixtures temporários e execução direta do script
- **CI**: GitHub Actions existente, com actions já fixadas por SHA
- **Constraints**: o script não gera migrations, não altera o banco e não lê variáveis de ambiente

## Constitution Check

- Conteúdo é dado e a versão continua derivada dos JSONs — OK.
- Nenhum segredo ou serviço externo é usado — OK.
- Sem dependência nova — OK.
- A proteção adiciona um gate de confiabilidade ao CI — OK.

## Project Structure

```text
scripts/check-content-version.js
scripts/check-content-version.test.js
.github/workflows/ci.yml
specs/004-content-version-ci/
```

## Research

- **Version source**: o jogo calcula FNV-1a de `[recipesData, kitchensData, cosmeticsData]`; o script deve usar a mesma ordem e serialização.
- **Migration source**: procurar as migrations em ordem inversa e usar a primeira que mencione `accepted_content_versions`; migrations posteriores sem essa chave não alteram a lista.
- **Failure behavior**: mensagem deve conter a versão calculada e pedir uma migration que a inclua, preservando revisão humana.
