-- KD-32 (#26): exclusão de conta e retenção de scores. Rode com npm run db:test.
-- Todos os dados são fictícios, conforme AGENTS.md.
begin;
create extension if not exists pgtap with schema extensions;
select plan(20);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'ana@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'bia@example.com');

insert into public.scores (match_id, user_id, score, duration_ms, seed, content_version, origin)
values
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 100, 180000, 1, '7691008a', 'online'),
  ('bbbbbbbb-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 200, 180000, 2, '7691008a', 'online'),
  ('bbbbbbbb-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 150, 180000, 3, '7691008a', 'online');

update public.scores
set created_at = now() - interval '91 days'
where match_id = 'bbbbbbbb-0000-0000-0000-000000000001';

update public.scores
set created_at = now() - interval '89 days'
where match_id = 'bbbbbbbb-0000-0000-0000-000000000002';

insert into public.best_scores (board, user_id, score, match_id) values
  ('global', '11111111-1111-1111-1111-111111111111', 100, 'aaaaaaaa-0000-0000-0000-000000000001'),
  ('global', '22222222-2222-2222-2222-222222222222', 200, 'bbbbbbbb-0000-0000-0000-000000000001');

insert into public.user_cosmetics (user_id, cosmetic_id) values
  ('11111111-1111-1111-1111-111111111111', 'hat_bordeaux');

update public.player_stats set matches_played = 1, total_score = 100
  where user_id = '11111111-1111-1111-1111-111111111111';
update public.player_stats set matches_played = 2, total_score = 350
  where user_id = '22222222-2222-2222-2222-222222222222';

-- ---------------------------------------------------------------- permissões
select ok(
  (select prosecdef from pg_proc where oid = 'public.delete_my_account()'::regprocedure),
  'delete_my_account é security definer');
select ok(
  (select proconfig @> array['search_path=""'] from pg_proc
   where oid = 'public.delete_my_account()'::regprocedure),
  'delete_my_account fixa search_path vazio');
select ok(
  not has_function_privilege('anon', 'public.delete_my_account()', 'execute'),
  'anon não executa delete_my_account');
select ok(
  has_function_privilege('authenticated', 'public.delete_my_account()', 'execute'),
  'authenticated executa delete_my_account');

set local role authenticated;
select throws_ok(
  $$select public.delete_my_account()$$,
  '28000', 'not_authenticated', 'sem auth.uid() a exclusão é recusada');

set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
select lives_ok($$select public.delete_my_account()$$, 'jogador autenticado exclui a própria conta');

reset role;
select is((select count(*)::int from auth.users where id = '11111111-1111-1111-1111-111111111111'), 0,
  'identidade da conta excluída não permanece');
select is((select count(*)::int from public.profiles where id = '11111111-1111-1111-1111-111111111111'), 0,
  'profile da conta excluída não permanece');
select is((select count(*)::int from public.user_settings where user_id = '11111111-1111-1111-1111-111111111111'), 0,
  'settings da conta excluída não permanecem');
select is((select count(*)::int from public.scores where user_id = '11111111-1111-1111-1111-111111111111'), 0,
  'scores da conta excluída não permanecem');
select is((select count(*)::int from public.best_scores where user_id = '11111111-1111-1111-1111-111111111111'), 0,
  'recordes da conta excluída não permanecem');
select is((select count(*)::int from public.player_stats where user_id = '11111111-1111-1111-1111-111111111111'), 0,
  'estatísticas da conta excluída não permanecem');
select is((select count(*)::int from public.user_cosmetics where user_id = '11111111-1111-1111-1111-111111111111'), 0,
  'cosméticos da conta excluída não permanecem');
select is((select count(*)::int from auth.users where id = '22222222-2222-2222-2222-222222222222'), 1,
  'a conta de outro jogador permanece');

-- ---------------------------------------------------------------- retenção
select is(
  (select schedule from cron.job where jobname = 'delete_expired_scores'),
  '0 3 * * *', 'limpeza é agendada diariamente às 03:00 UTC');
select lives_ok(
  (select command from cron.job where jobname = 'delete_expired_scores'),
  'comando agendado de retenção executa');
select is((select count(*)::int from public.scores where match_id = 'bbbbbbbb-0000-0000-0000-000000000001'), 0,
  'score com mais de 90 dias é removido');
select is((select count(*)::int from public.scores where match_id = 'bbbbbbbb-0000-0000-0000-000000000002'), 1,
  'score com menos de 90 dias permanece');
select is(
  (select row(score, match_id)::text from public.best_scores where board = 'global'
    and user_id = '22222222-2222-2222-2222-222222222222'),
  '(200,bbbbbbbb-0000-0000-0000-000000000001)', 'recorde permanece após expirar seu score histórico');
select is(
  (select row(matches_played, total_score)::text from public.player_stats
    where user_id = '22222222-2222-2222-2222-222222222222'),
  '(2,350)', 'estatísticas permanecem após a retenção');

select * from finish();
rollback;
