# Research: Privacidade (LGPD)

## R1. Conteúdo da política
- **Decision**: 7 seções (dados coletados, finalidade, retenção, compartilhamento, cookies e armazenamento local, direitos, contato), com fatos tirados de SYSTEM_DESIGN (D7 retenção de 90 dias, D9 Turnstile, D11 Sentry sem PII, D13 sem cookies de analytics, §6.4).
- **Alternatives**: texto jurídico completo — fora do alcance de um agente; fica como revisão pendente.

## R2. Dados da empresa
- **Decision**: marcadores "[a definir]" para controlador e encarregado; nada inventado.

## R3. Rolagem até a âncora
- **Decision**: o react-router não rola até `#hash`; o perfil rola até `excluir-conta` quando a seção aparece (ela depende de carregar o serviço).
- **Alternatives**: rota própria `/perfil/excluir` — rejeitada, duplica a tela.
