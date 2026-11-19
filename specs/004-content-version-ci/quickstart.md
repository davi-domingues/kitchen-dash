# Quickstart: Versão de conteúdo no CI

1. Execute `node scripts/check-content-version.js` com os arquivos de conteúdo e migrations atuais; o processo deve sair com código zero.
2. Execute `npm test`; os testes cobrem lista presente, versão ausente e migrations posteriores irrelevantes.
3. Confirme em `.github/workflows/ci.yml` que o check roda no job Qualidade após `npm ci`.
