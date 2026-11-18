-- KD-30 (#24): prova que anon não escreve e só lê o permitido (SYSTEM_DESIGN §6.1).
-- Rode com `npm run db:test`. Dados fictícios (@example.com).
begin;
create extension if not exists pgtap with schema extensions;
select plan(29);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'ana@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'bia@example.com');

-- Linhas que só uma RPC escreveria (aqui como postgres).
insert into public.scores (match_id, user_id, score, duration_ms, seed, content_version, origin) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 100, 180000, 42, '1', 'online'),
  ('aaaaaaaa-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 200, 180000, 7, '1', 'online');
insert into public.best_scores (board, user_id, score, match_id) values
  ('global', '11111111-1111-1111-1111-111111111111', 100, 'aaaaaaaa-0000-0000-0000-000000000001'),
  ('global', '22222222-2222-2222-2222-222222222222', 200, 'aaaaaaaa-0000-0000-0000-000000000002');
insert into public.user_cosmetics (user_id, cosmetic_id) values
  ('11111111-1111-1111-1111-111111111111', 'hat_red'),
  ('22222222-2222-2222-2222-222222222222', 'hat_blue');

-- Trigger
select is((select count(*)::int from public.profiles), 2, 'trigger cria um profile por usuário');
select is((select count(*)::int from public.player_stats), 2, 'trigger cria player_stats por usuário');
select is((select count(*)::int from public.user_settings), 2, 'trigger cria user_settings por usuário');

select ok(
  (select bool_and(relrowsecurity) from pg_class
   where oid in ('public.profiles'::regclass, 'public.scores'::regclass, 'public.best_scores'::regclass,
                 'public.player_stats'::regclass, 'public.user_cosmetics'::regclass, 'public.user_settings'::regclass, 'public.game_rules'::regclass)),
  'RLS ligada em todas as tabelas');

-- ---------------------------------------------------------------- anon
set local role anon;

select is((select count(*)::int from public.public_profiles), 2, 'anon lê public_profiles');
select is((select count(*)::int from public.best_scores), 2, 'anon lê best_scores');
select is((select count(*)::int from public.game_rules), 6, 'anon lê game_rules');
select throws_ok('select * from public.user_settings', '42501', null, 'anon não lê user_settings');
select throws_ok('select * from public.scores', '42501', null, 'anon não lê scores');
select throws_ok('select * from public.player_stats', '42501', null, 'anon não lê player_stats');
select throws_ok('select * from public.user_cosmetics', '42501', null, 'anon não lê user_cosmetics');
select throws_ok(
  $$insert into public.scores (match_id, user_id, score, duration_ms, seed, content_version, origin)
    values (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 1, 180000, 1, '1', 'online')$$,
  '42501', null, 'anon não insere em scores');
select throws_ok($$update public.best_scores set score = 999999$$, '42501', null, 'anon não altera best_scores');
select throws_ok($$update public.profiles set display_name = 'hacker'$$, '42501', null, 'anon não altera profiles');
select throws_ok($$delete from public.game_rules$$, '42501', null, 'anon não apaga game_rules');

-- ---------------------------------------------------------- authenticated (Ana)
reset role;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);
set local role authenticated;

select is((select count(*)::int from public.scores), 1, 'autenticado lê só os próprios scores');
select is((select count(*)::int from public.player_stats), 1, 'autenticado lê só o próprio player_stats');
select is((select count(*)::int from public.user_cosmetics), 1, 'autenticado lê só os próprios cosméticos');
select is((select count(*)::int from public.best_scores), 2, 'autenticado lê o ranking inteiro');
select is((select count(*)::int from public.user_settings), 1, 'autenticado lê só o próprio user_settings');
select lives_ok($$update public.user_settings set settings = '{"lang":"pt-BR"}' where user_id = '11111111-1111-1111-1111-111111111111'$$,
  'autenticado altera as próprias settings');
update public.user_settings set settings = '{"x":1}' where user_id = '22222222-2222-2222-2222-222222222222';
reset role;
select is((select settings from public.user_settings where user_id = '22222222-2222-2222-2222-222222222222'),
  '{}'::jsonb, 'autenticado não altera settings de outro');
set local role authenticated;
select throws_ok($$insert into public.user_settings (user_id) values (gen_random_uuid())$$, '42501', null,
  'autenticado não insere user_settings');

select lives_ok($$update public.profiles set display_name = 'ana_chef' where id = '11111111-1111-1111-1111-111111111111'$$,
  'autenticado altera o próprio display_name');
update public.profiles set display_name = 'roubado' where id = '22222222-2222-2222-2222-222222222222';
select is((select display_name from public.profiles where id = '22222222-2222-2222-2222-222222222222'),
  'player_222222222222', 'autenticado não altera o profile de outro');
select throws_ok($$update public.profiles set id = gen_random_uuid()$$, '42501', null, 'autenticado não altera o id');
select throws_ok(
  $$insert into public.scores (match_id, user_id, score, duration_ms, seed, content_version, origin)
    values (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 1, 180000, 1, '1', 'online')$$,
  '42501', null, 'autenticado não insere em scores direto');
select throws_ok($$update public.player_stats set total_score = 999999$$, '42501', null,
  'autenticado não altera player_stats direto');
select throws_ok($$insert into public.user_cosmetics (user_id, cosmetic_id) values ('11111111-1111-1111-1111-111111111111', 'x')$$,
  '42501', null, 'autenticado não desbloqueia cosmético direto');

select * from finish();
rollback;
