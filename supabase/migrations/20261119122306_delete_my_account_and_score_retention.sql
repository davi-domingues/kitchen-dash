-- KD-32 (#26): exclusão integral de conta e retenção de scores.
-- A limpeza diária às 03:00 UTC preserva best_scores e player_stats, que são
-- progresso permanente; scores é apenas o histórico de 90 dias.

create extension if not exists pg_cron with schema pg_catalog;

create function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
begin
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  -- profiles e seus dados dependentes usam on delete cascade a partir de auth.users.
  delete from auth.users where id = v_user_id;
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

select cron.schedule(
  'delete_expired_scores',
  '0 3 * * *',
  $$delete from public.scores where created_at < now() - interval '90 days'$$
);
