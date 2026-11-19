-- KD-38 (#31): set_equipped. Rode com `npm run db:test`. Dados fictícios (@example.com).
begin;
create extension if not exists pgtap with schema extensions;
select plan(12);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'ana@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'bia@example.com');
insert into public.user_cosmetics (user_id, cosmetic_id) values
  ('11111111-1111-1111-1111-111111111111', 'hat_navy');

select ok(
  (select prosecdef from pg_proc where oid = 'public.set_equipped(jsonb)'::regprocedure),
  'set_equipped é security definer');
select ok(
  (select proconfig @> array['search_path=""'] from pg_proc where oid = 'public.set_equipped(jsonb)'::regprocedure),
  'set_equipped fixa search_path vazio');
select ok(not has_function_privilege('anon', 'public.set_equipped(jsonb)', 'execute'), 'anon não executa');
select ok(has_function_privilege('authenticated', 'public.set_equipped(jsonb)', 'execute'), 'authenticated executa');
select ok(
  not has_column_privilege('authenticated', 'public.profiles', 'equipped', 'update'),
  'authenticated não altera equipped direto');

set local role authenticated;
select throws_ok($$select public.set_equipped('{"hat": "hat_navy"}')$$, '28000', 'not_authenticated', 'sem auth é recusado');

set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
select is(
  public.set_equipped('{"hat": "hat_navy", "apron": "apron_cream"}'),
  '{"hat": "hat_navy", "apron": "apron_cream"}'::jsonb,
  'item possuído e gratuito são aceitos');
select is(
  (select equipped from public.profiles where id = '11111111-1111-1111-1111-111111111111'),
  '{"hat": "hat_navy", "apron": "apron_cream"}'::jsonb,
  'equipado gravado no perfil');
select throws_ok($$select public.set_equipped('{"hat": "hat_gold"}')$$, '42501', 'cosmetic_not_owned', 'item não possuído é recusado');
select throws_ok($$select public.set_equipped('{"shoes": "hat_navy"}')$$, '22023', 'invalid_equipped', 'slot desconhecido é recusado');
select throws_ok($$select public.set_equipped('["hat_navy"]')$$, '22023', 'invalid_equipped', 'não objeto é recusado');

set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';
select throws_ok($$select public.set_equipped('{"hat": "hat_navy"}')$$, '42501', 'cosmetic_not_owned', 'posse é por conta');

select * from finish();
rollback;
