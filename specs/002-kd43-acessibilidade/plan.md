# Plano: KD-43

**Branch**: `feat/kd-43-acessibilidade` · **Spec**: [spec.md](spec.md)

## Resumo

Revisar menus e contraste; implementar preferência local para efeitos, padrão do sistema e aviso de toque. O Phaser atual não possui tremores ou flashes.

## Contexto técnico

JavaScript, React, Vite, daisyUI e Vitest existentes; configurações via `services/storage.js`; sem novas dependências ou mudanças de banco. A aplicação deve continuar funcional offline e sem armazenamento persistente.

## Constituição e estrutura

Manter i18n, fronteiras de importação, testes determinísticos e gates existentes. A persistência fica em `src/services/settings.js`, a interface em `src/features/match` e `src/app`, o estilo em `src/index.css` e traduções em `src/i18n/pt-BR.json`.

## Verificação

Testar persistência e dados inválidos, percorrer menus com teclado, verificar a pausa e os estados de toque e movimento, medir os pares de contraste usados e executar os gates locais. Documentar verificações manuais que não possam ser realizadas.
