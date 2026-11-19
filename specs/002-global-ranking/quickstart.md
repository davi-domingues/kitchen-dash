# Quickstart: KD-36

## Pré-requisitos

- Dependências instaladas após incluir `@tanstack/react-query@5.108.0` e lockfile no PR.
- Supabase local com migrations da KD-30; testes não usam Supabase remoto.

## Validar leitura e estados

1. Executar `npm test`.
   - Esperado: testes Vitest verificam os seis quadros permitidos, projeção somente dos campos públicos, paginação/ordem, erros propagados e cache por quadro/página.
2. Executar `npm run lint`, `npm run format:check`, `npm run build` e `npm run check-size`.
   - Esperado: comandos terminam com sucesso e o bundle continua dentro do orçamento.
3. Executar `npm run dev`, abrir `/ranking` e navegar por teclado.
   - Esperado: primeira página exibe no máximo 20 linhas e quadro/modo selecionado.
4. Testar quadro vazio e mais de 20 registros.
   - Esperado: vazio tem mensagem própria; próximo/anterior não duplica linhas e preserva a ordem.
5. Com dados carregados, simular indisponibilidade de rede e trocar de página; depois repetir sem cache.
   - Esperado: cache prévio fica identificado como desatualizado e oferece retry; primeira carga offline mostra erro/offline, não tabela vazia.
6. Recuperar a rede e repetir.
   - Esperado: retry atualiza os dados sem reload da aplicação.

## Verificações de produto

- Confirmar acesso público sem sessão.
- Confirmar todos os seis quadros e que Desafio usa pontuação, conforme clarificação de produto.
- Confirmar que apenas nome público, pontuação e posição são exibidos; sem e-mail ou configurações.
- Validar que as decisões públicas/métrica foram alinhadas em documentação no mesmo PR.
