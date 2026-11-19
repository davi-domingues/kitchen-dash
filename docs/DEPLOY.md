# Deploy e previews (Cloudflare Pages)

O app é publicado no **Cloudflare Pages**, ligado a este repositório. Não há passo manual de deploy: o push dispara o build.

| Ambiente | Quando é gerado | URL |
|---|---|---|
| **Produção** | merge na `main` | https://kitchen-dash-015.pages.dev |
| **Preview** | push em qualquer outra branch | ver abaixo |

## Como abrir o preview de uma branch

Cada branch com push ganha um **alias fixo**, que sempre aponta para o último deploy dela:

```
https://<branch>.kitchen-dash-015.pages.dev
```

`<branch>` é o nome da branch em minúsculas, com `/` e outros caracteres especiais trocados por `-`:

| Branch | Preview |
|---|---|
| `feat/kd-40-sentry` | https://feat-kd-40-sentry.kitchen-dash-015.pages.dev |
| `fix/kd-12-colisao` | https://fix-kd-12-colisao.kitchen-dash-015.pages.dev |

Nomes muito longos são truncados pela Cloudflare. Na dúvida, use uma das opções abaixo.

**Outras formas de achar a URL:**

- **No PR:** o check **Cloudflare Pages** leva ao deploy. Cada deploy também tem uma URL própria e imutável, `https://<id>.kitchen-dash-015.pages.dev`, em que `<id>` são os 8 primeiros caracteres do ID do deploy (o trecho depois de `/view/kitchen-dash/` no link do check).
- **No painel:** *Workers & Pages → kitchen-dash → Deployments* lista todos os deploys com as URLs. O acesso ao painel é restrito aos mantenedores.

**Como usar o preview na revisão:**

- Teste o PR no preview antes de aprovar, principalmente telas e o jogo (`/jogar`).
- O preview usa as mesmas variáveis públicas de produção, exceto `VITE_SENTRY_ENVIRONMENT=preview`. Os erros aparecem no Sentry separados dos de produção.
- O banco é o **mesmo projeto Supabase** de produção (plano Free tem um projeto só). Não use dados reais nem faça testes destrutivos num preview.

## Build

| Configuração | Valor |
|---|---|
| Build command | `npm run build` |
| Output | `dist` |
| `NODE_VERSION` | `24` (igual ao `.nvmrc`) |
| Branch de produção | `main` |
| Previews | todas as outras branches |

## Variáveis de ambiente

Ficam no painel da Cloudflare (*Settings → Variables and Secrets*), separadas por ambiente. Os nomes estão em [`.env.example`](../.env.example).

| Variável | Production | Preview |
|---|---|---|
| `VITE_SUPABASE_URL` | URL do projeto | igual |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` | igual |
| `VITE_SENTRY_DSN` | DSN do projeto | igual |
| `VITE_SENTRY_ENVIRONMENT` | `production` | `preview` |

- Toda variável `VITE_*` é **embutida no JS** durante o build, portanto é **pública**. Nunca coloque segredo nelas (AGENTS.md §6). A chave `sb_secret_` / `service_role` é recusada pelo app.
- Mudar uma variável só vale no **próximo** build: faça *Retry deployment* no painel ou um novo push.

## Headers e rotas

- `public/_redirects`: fallback da SPA (`/* /index.html 200`). Recarregar `/jogar` abre o app em vez de um 404.
- `public/_headers`: CSP, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, COOP e cache imutável em `/assets/*`. Validado por `src/deploy/headers.test.js`.
- Uma origem nova (outro serviço, CDN, analytics) **precisa** ser liberada na CSP no mesmo PR. Senão o navegador bloqueia; veja o console em *Refused to ... Content Security Policy*.

Para conferir os headers de um deploy:

```sh
curl -sI https://kitchen-dash-015.pages.dev/ | grep -iE "content-security|x-frame|nosniff|referrer|permissions|cross-origin"
```
