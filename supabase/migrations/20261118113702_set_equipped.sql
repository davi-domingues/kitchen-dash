-- KD-38 (#31): itens equipados no perfil só pela RPC set_equipped, que valida a posse
-- (AGENTS §6: escrita de cosméticos só por RPC). O update direto de `equipped` sai do authenticated.

revoke update (equipped) on public.profiles from authenticated;

-- Gratuito = id fora de game_rules.cosmetic_unlocks; o banco não guarda o catálogo,
-- e o cliente descarta id desconhecido ao sanear o estado (KD-23).
create function public.set_equipped(p_equipped jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_unlocks jsonb;
  v_slot text;
  v_id text;
begin
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  if p_equipped is null or jsonb_typeof(p_equipped) <> 'object' then
    raise exception 'invalid_equipped' using errcode = '22023';
  end if;

  select r.value into v_unlocks from public.game_rules r where r.key = 'cosmetic_unlocks';

  for v_slot, v_id in select e.key, e.value #>> '{}' from jsonb_each(p_equipped) e loop
    if v_slot not in ('hat', 'apron', 'theme')
       or jsonb_typeof(p_equipped -> v_slot) <> 'string'
       or v_id !~ '^[a-z0-9_]{1,40}$' then
      raise exception 'invalid_equipped' using errcode = '22023';
    end if;
    if coalesce(v_unlocks ? v_id, false) and not exists (
      select 1 from public.user_cosmetics c where c.user_id = v_user_id and c.cosmetic_id = v_id
    ) then
      raise exception 'cosmetic_not_owned' using errcode = '42501';
    end if;
  end loop;

  update public.profiles set equipped = p_equipped where id = v_user_id;
  return p_equipped;
end;
$$;

revoke execute on function public.set_equipped(jsonb) from public, anon;
grant execute on function public.set_equipped(jsonb) to authenticated;
