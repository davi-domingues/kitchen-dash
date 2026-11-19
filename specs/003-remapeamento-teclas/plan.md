# Plano: remapeamento de teclas

**Branch**: `feat/kd-75-remapeamento-teclas` · **Spec**: [spec.md](spec.md)

## Abordagem

Adicionar rota React de controles acessível pela home e pela configuração da partida. Reutilizar `remapKey`, `loadKeyBindings` e `saveKeyBindings`; mostrar trocas, cancelamento e recuperação do padrão. Restringir captura a códigos de teclado utilizáveis e preservar Tab/Escape e combinações de sistema.

## Contexto e fronteiras

JavaScript, React, React Router, i18next, Vitest e storage local existentes; sem dependências, banco ou mudanças no core. A página do jogo lê a configuração ao ser montada, após o retorno da tela de controles.

## Constituição e verificação

Respeitar i18n, funcionamento offline, persistência versionada e fronteiras de importação. Testar seleção e troca com funções puras, persistência já existente e executar todos os gates. Verificar navegação, foco, cancelamento e armazenamento no navegador quando disponível.
