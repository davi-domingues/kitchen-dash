# Checklist de lançamento — Kitchen Dash v1.0.0

Checklist da KD-46 (issue #39). Cada item liga a um ponto da [ARQUITETURA §9](ARQUITETURA.md#9-escopo-do-mvp) ou ao escopo da issue e diz **como verificar**. Só marque `[x]` depois de verificar **em produção**, com a evidência (print, link do log ou saída do comando) no comentário da issue #39. Item que falhar vira issue nova, e a tag espera a correção.

Pré-requisito: todos os PRs previstos para a v1.0.0 mergeados (ver [RELEASE_NOTES_v1.0.0.md](RELEASE_NOTES_v1.0.0.md)) e o deploy de produção concluído.

## 1. Escopo do MVP (ARQUITETURA §9)

- [ ] **Partida jogável sem login** (§9.1): em aba anônima, abra o site de produção, jogue uma partida de cada modo e veja a tela de resultado; nenhuma chamada autenticada no DevTools > Rede.
- [ ] **Login por OTP de e-mail** (§9.2): entre com um e-mail `@example.com` de teste controlado pelo time, receba o código de 6 dígitos e confirme a sessão no perfil.
- [ ] **Ranking global com validação por RPC** (§9.3): jogue logado no Clássico; a pontuação aparece no ranking e a requisição é `POST /rest/v1/rpc/submit_score`. Uma pontuação forjada pelo console é recusada.
- [ ] **Cosméticos desbloqueados jogando** (§9.4): bata um recorde, desbloqueie e equipe um cosmético; ele persiste depois de sair e entrar de novo.

## 2. Autenticação e abuso (escopo da issue)

- [ ] **Turnstile ligado**: Supabase > Authentication > Attack Protection com CAPTCHA Turnstile ativo; o login sem token é recusado.
- [ ] **Limites de OTP**: Authentication > Rate Limits com limite de envio de e-mails e de verificação de OTP conferidos; registre os valores aqui.
- [ ] **SMTP de produção** (ARQUITETURA §10.1): o e-mail de OTP sai pelo provedor definido (Resend), não pelo SMTP padrão.

## 3. Cabeçalhos e CSP

- [ ] **CSP ativa**: `curl -sI https://<domínio>/ | grep -i content-security-policy` devolve a política de `public/_headers`.
- [ ] **Sem violações**: console do navegador sem erro de CSP durante login, partida, ranking e envio ao Sentry.
- [ ] **Cache**: assets com hash em `immutable`; `index.html` e `sw.js` sem cache longo.

## 4. Sentry

- [ ] **DSN de produção**: `VITE_SENTRY_DSN` e `VITE_SENTRY_ENVIRONMENT=production` configurados no build da Cloudflare.
- [ ] **Source maps** (KD-45, PR #97): um erro de teste em produção aparece com arquivo e linha do código-fonte; os `.map` não ficam públicos em `dist/`.
- [ ] **Sem PII**: o evento de teste não traz e-mail, IP nem cookies (`sendDefaultPii: false`).
- [ ] **Release**: o evento traz `release` igual a `1.0.0` ou ao SHA do deploy.

## 5. Banco e backups

- [ ] **Environment `production`** no GitHub com revisor obrigatório para o job de migrations (KD-45).
- [ ] **Migrations aplicadas**: `supabase migration list` no projeto remoto sem pendência local × remoto.
- [ ] **Advisors remotos**: advisors de segurança e de performance do Supabase sem alerta crítico; cite o resultado na issue.
- [ ] **RLS** ligada em todas as tabelas (advisor de segurança limpo).
- [ ] **Backups**: plano atual confirmado e a política registrada; no plano gratuito, sem PITR, o risco fica aceito (abaixo).

## 6. PWA e offline

- [ ] **Instalável**: Lighthouse > PWA sem falha; manifest e ícones carregam.
- [ ] **Offline**: com a rede desligada no DevTools, o jogo abre e uma partida de visitante completa; o envio de pontuação fica na outbox e sobe ao voltar a rede.
- [ ] **Atualização**: um deploy novo mostra o aviso de atualização.

## 7. LGPD

- [ ] **Política de privacidade** publicada e ligada no rodapé e no perfil (KD-44, PR #106).
- [ ] **Controlador**: nome e contato do controlador preenchidos na política. _A preencher pela pessoa responsável._
- [ ] **Encarregado (DPO)**: nome e e-mail preenchidos. _A preencher pela pessoa responsável._
- [ ] **Exclusão de conta**: excluir uma conta de teste remove perfil, pontuações e cosméticos.

## 8. Acessibilidade

- [ ] **Teclado**: menu, configuração de partida, pausa, resultado, ranking, login e perfil navegáveis só por teclado, com foco visível.
- [ ] **Opções de acessibilidade** (KD-43) persistem após recarregar.
- [ ] **Lighthouse > Acessibilidade** ≥ 90 nas telas principais.

## 9. QA manual

- [ ] Roteiro de [QA_MANUAL_v1.0.0.md](QA_MANUAL_v1.0.0.md) executado em produção, com os resultados anotados.

## 10. Riscos aceitos

Registre aqui quem aceitou e quando:

- [ ] Sem PITR no plano gratuito do Supabase: perda de até 24 h de pontuações num incidente.
- [ ] Validação de plausibilidade da pontuação reduz, mas não impede, trapaça no cliente.
- [ ] Projeto do Supabase gratuito pausa após inatividade.

## 11. Versão

- [ ] Todos os PRs previstos na release mergeados e a `main` com CI verde.
- [ ] Itens 1 a 10 verificados em produção.
- [ ] Tag criada **pela pessoa**: `git tag -a v1.0.0 -m "Kitchen Dash v1.0.0" && git push origin v1.0.0`, e release publicada no GitHub com as notas.
