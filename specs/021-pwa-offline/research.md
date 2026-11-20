# Research

- **Decision**: generateSW com `registerType: 'prompt'`. **Rationale**: a §8.4 exige aviso e proíbe trocar no meio da partida. **Alternatives**: `autoUpdate` (troca sozinha, rejeitado); injectManifest (SW próprio, mais código sem ganho).
- **Decision**: `NetworkOnly` por `urlPattern` para Supabase, Sentry e Turnstile. **Rationale**: dados e auth nunca vêm de cache; a regra explícita documenta e protege contra cache acidental.
- **Decision**: `navigateFallback: 'index.html'`. **Rationale**: SPA; rotas internas abrem offline.
- **Decision**: ícone SVG único. **Rationale**: evita `@vite-pwa/assets-generator` (dependência nova). Alguns navegadores pedem PNG 192/512 para instalar: pendência.
- **Decision**: `injectRegister: false` e registro em `services/pwa.js` via `virtual:pwa-register`, carregado por import dinâmico só em produção. **Rationale**: CSP sem script inline, fornecedor isolado e JS inicial pequeno.
- **Decision**: a CSP já tem `worker-src 'self' blob:` e `manifest-src 'self'`; `sw.js` e `manifest.webmanifest` ganham `Cache-Control: no-cache` em `_headers` para o navegador detectar deploys.
