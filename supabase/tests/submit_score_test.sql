-- KD-31 (#25): submit_score (SYSTEM_DESIGN §6.2). Rode com `npm run db:test`.
-- Dados fictícios (@example.com). Regras de game_rules da migration:
-- duração 170000..200000 ms, score <= 180 + ceil(s) * 15, versão "7691008a", 10 envios/min.
begin;
create extension if not exists pgtap with schema extensions;
select plan(32);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'ana@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'bia@example.com'),
  ('33333333-3333-3333-3333-333333333333', 'caio@example.com');

-- Bia já fez 10 envios no último minuto (inseridos como postgres).
insert into public.scores (match_id, user_id, score, duration_ms, seed, content_version, origin)
select gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 10, 180000, 1, '7691008a', 'online'
from generate_series(1, 10);

-- ---------------------------------------------------------------- permissões
select ok(
  (select prosecdef from pg_proc where oid = 'public.submit_score(uuid,text,integer,integer,bigint,text,text,integer)'::regprocedure),
  'submit_score é security definer');
select ok(
  (select proconfig @> array['search_path=""'] from pg_proc
   where oid = 'public.submit_score(uuid,text,integer,integer,bigint,text,text,integer)'::regprocedure),
  'submit_score fixa search_path vazio');
select ok(
  not has_function_privilege('anon', 'public.submit_score(uuid,text,integer,integer,bigint,text,text,integer)', 'execute'),
  'anon não executa submit_score');
select ok(
  has_function_privilege('authenticated', 'public.submit_score(uuid,text,integer,integer,bigint,text,text,integer)', 'execute'),
  'authenticated executa submit_score');

-- ---------------------------------------------------------------- sem auth
set local role authenticated;
select throws_ok(
  $$select public.submit_score('aaaaaaaa-0000-0000-0000-000000000001', 'global', 100, 180000, 42, '7691008a', 'online', 2)$$,
  '28000', 'not_authenticated', 'sem auth.uid() é recusado');

-- ---------------------------------------------------------------- Ana: envio válido
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select is(
  public.submit_score('aaaaaaaa-0000-0000-0000-000000000001', 'global', 320, 180000, 42, '7691008a', 'online', 5),
  '{"match_id": "aaaaaaaa-0000-0000-0000-000000000001", "is_new_best": true, "best_score": 320, "unlocked_cosmetics": ["apron_herbs", "hat_bordeaux"]}'::jsonb,
  'primeira partida vira recorde e desbloqueia cosméticos até 320');

select is(
  (select count(*)::int from public.scores where match_id = 'aaaaaaaa-0000-0000-0000-000000000001'),
  1, 'partida gravada em scores');
select is(
  (select row(matches_played, total_score, orders_completed, play_time_ms)::text
   from public.player_stats where user_id = '11111111-1111-1111-1111-111111111111'),
  '(1,320,5,180000)', 'player_stats soma a partida');

-- ---------------------------------------------------------------- idempotência
select is(
  public.submit_score('aaaaaaaa-0000-0000-0000-000000000001', 'global', 320, 180000, 42, '7691008a', 'online', 5),
  '{"match_id": "aaaaaaaa-0000-0000-0000-000000000001", "is_new_best": true, "best_score": 320, "unlocked_cosmetics": []}'::jsonb,
  'reenvio devolve o resultado sem novos desbloqueios');
select is(
  (select count(*)::int from public.scores where match_id = 'aaaaaaaa-0000-0000-0000-000000000001'),
  1, 'reenvio não duplica scores');
select is(
  (select matches_played from public.player_stats where user_id = '11111111-1111-1111-1111-111111111111'),
  1, 'reenvio não soma player_stats de novo');

-- ---------------------------------------------------------------- recorde menor
select is(
  public.submit_score('aaaaaaaa-0000-0000-0000-000000000002', 'global', 100, 175000, 7, '7691008a', 'local', 1),
  '{"match_id": "aaaaaaaa-0000-0000-0000-000000000002", "is_new_best": false, "best_score": 320, "unlocked_cosmetics": []}'::jsonb,
  'partida menor não troca o recorde');
select is(
  (select row(score, match_id)::text from public.best_scores
   where board = 'global' and user_id = '11111111-1111-1111-1111-111111111111'),
  '(320,aaaaaaaa-0000-0000-0000-000000000001)', 'best_scores mantém o maior');
select is(
  (select row(matches_played, total_score, orders_completed, play_time_ms)::text
   from public.player_stats where user_id = '11111111-1111-1111-1111-111111111111'),
  '(2,420,6,355000)', 'player_stats acumula a segunda partida');

-- ---------------------------------------------------------------- recorde maior em outro placar
select is(
  public.submit_score('aaaaaaaa-0000-0000-0000-000000000003', 'classic_2p', 650, 180000, 9, '7691008a', 'online', 8)
    -> 'unlocked_cosmetics',
  '["apron_bistro", "hat_navy", "theme_marble"]'::jsonb,
  'novo recorde pessoal desbloqueia só os itens ainda não liberados');
select is(
  (select count(*)::int from public.user_cosmetics where user_id = '11111111-1111-1111-1111-111111111111'),
  5, 'user_cosmetics sem duplicatas');

-- ---------------------------------------------------------------- plausibilidade e entrada
select throws_ok(
  $$select public.submit_score('aaaaaaaa-0000-0000-0000-000000000010', 'global', 100, 169999, 1, '7691008a', 'online', 1)$$,
  '22023', 'implausible_duration', 'duração abaixo do mínimo é recusada');
select throws_ok(
  $$select public.submit_score('aaaaaaaa-0000-0000-0000-000000000011', 'global', 100, 200001, 1, '7691008a', 'online', 1)$$,
  '22023', 'implausible_duration', 'duração acima do máximo é recusada');
select throws_ok(
  $$select public.submit_score('aaaaaaaa-0000-0000-0000-000000000012', 'global', 2881, 180000, 1, '7691008a', 'online', 1)$$,
  '22023', 'implausible_score', 'pontuação acima do teto por segundo é recusada');
select lives_ok(
  $$select public.submit_score('aaaaaaaa-0000-0000-0000-000000000013', 'global', 2880, 180000, 1, '7691008a', 'online', 1)$$,
  'pontuação exatamente no teto é aceita');
select lives_ok(
  $$select public.submit_score('aaaaaaaa-0000-0000-0000-000000000019', 'global', 2820, 175001, 1, '7691008a', 'online', 1)$$,
  'segundo parcial arredonda para cima (180 + 176 × 15)');
select throws_ok(
  $$select public.submit_score('aaaaaaaa-0000-0000-0000-000000000014', 'global', 100, 180000, 1, 'deadbeef', 'online', 1)$$,
  '22023', 'unknown_content_version', 'versão de conteúdo fora da lista é recusada');
select throws_ok(
  $$select public.submit_score('aaaaaaaa-0000-0000-0000-000000000015', 'global', 100, 180000, 4294967296, '7691008a', 'online', 1)$$,
  '22023', 'invalid_input', 'seed fora de uint32 é recusada');
select throws_ok(
  $$select public.submit_score('aaaaaaaa-0000-0000-0000-000000000016', 'Global!', 100, 180000, 1, '7691008a', 'online', 1)$$,
  '22023', 'invalid_input', 'board fora do formato é recusado');
select throws_ok(
  $$select public.submit_score('aaaaaaaa-0000-0000-0000-000000000017', 'global', 100, 180000, 1, '7691008a', 'cloud', 1)$$,
  '22023', 'invalid_input', 'origin desconhecida é recusada');
select lives_ok(
  $$select public.submit_score('aaaaaaaa-0000-0000-0000-000000000018', 'global', 0, 180000, 0, '7691008a', 'online', 0)$$,
  'pontuação zero é aceita');
select is(
  (select count(*)::int from public.scores where user_id = '11111111-1111-1111-1111-111111111111'),
  6, 'envios recusados não gravam nada');

-- ---------------------------------------------------------------- outro dono e rate limit
set local request.jwt.claims = '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}';
select throws_ok(
  $$select public.submit_score('aaaaaaaa-0000-0000-0000-000000000001', 'global', 320, 180000, 42, '7691008a', 'online', 5)$$,
  '23505', 'match_conflict', 'match_id de outro usuário é recusado sem revelar o resultado');

set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';
select throws_ok(
  $$select public.submit_score('bbbbbbbb-0000-0000-0000-000000000001', 'global', 100, 180000, 1, '7691008a', 'online', 1)$$,
  '54000', 'rate_limited', 'frequência acima do limite por minuto é recusada');
select lives_ok(
  $$select public.submit_score((select match_id from public.scores
     where user_id = '22222222-2222-2222-2222-222222222222' limit 1), 'global', 10, 180000, 1, '7691008a', 'online', 0)$$,
  'reenvio idempotente passa mesmo com o limite atingido');

-- ---------------------------------------------------------------- escrita direta continua bloqueada
select throws_ok(
  $$insert into public.best_scores (board, user_id, score, match_id)
    values ('global', '22222222-2222-2222-2222-222222222222', 9999, gen_random_uuid())$$,
  '42501', null, 'authenticated não escreve best_scores fora da RPC');

reset role;
set local role anon;
select throws_ok(
  $$select public.submit_score('cccccccc-0000-0000-0000-000000000001', 'global', 100, 180000, 1, '7691008a', 'online', 1)$$,
  '42501', null, 'anon não chama submit_score');

select * from finish();
rollback;
