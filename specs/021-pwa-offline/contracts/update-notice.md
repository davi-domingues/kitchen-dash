# Contrato: aviso de atualização

- `services/pwa.js`: `registerServiceWorker({ onNeedRefresh })` devolve a função `updateSW(reload)` do plugin, ou `null` fora de produção ou sem suporte.
- UI: região `role="status"` com `aria-live="polite"`; mensagem `pwa.update.message`; botões `pwa.update.reload` e `pwa.update.dismiss`.
