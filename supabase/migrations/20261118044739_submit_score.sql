-- KD-31 (#25): RPC submit_score (SYSTEM_DESIGN §6.2). Contrato em
-- specs/001-rpc-submit-score/contracts/submit_score.md.

-- Limiares de recorde pessoal do PRD (Personalização). Itens grátis não entram:
-- ninguém precisa desbloqueá-los. Ids provisórios até o catálogo da KD-23.
insert into public.game_rules (key, value, description) values
  ('cosmetic_unlocks',
   '{"hat_bordeaux": 300, "hat_navy": 600, "hat_gold": 1000, "apron_herbs": 200, "apron_bistro": 500, "apron_macaron": 800, "theme_marble": 400, "theme_provence": 700}',
   'Recorde pessoal mínimo para desbloquear cada cosmético');

create function public.submit_score(
  p_match_id uuid,
  p_board text,
  p_score integer,
  p_duration_ms integer,
  p_seed bigint,
  p_content_version text,
  p_origin text,
  p_orders_completed integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_rules jsonb;
  v_owner uuid;
  v_previous_best integer;
  v_best integer;
  v_is_new_best boolean;
  v_personal_best integer;
  v_unlocked text[];
begin
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  if p_match_id is null or p_board is null or p_score is null or p_duration_ms is null
     or p_seed is null or p_content_version is null or p_origin is null
     or p_orders_completed is null
     or p_board !~ '^[a-z0-9_-]{1,40}$'
     or p_score < 0 or p_orders_completed < 0
     or p_seed not between 0 and 4294967295
     or p_origin not in ('online', 'local') then
    raise exception 'invalid_input' using errcode = '22023';
  end if;

  -- Serializa os envios do mesmo usuário: o rate limit e o upsert do recorde
  -- dependem de leituras feitas antes da escrita.
  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text, 31));

  -- Idempotência antes do rate limit: o reenvio da outbox nunca é barrado.
  select s.user_id into v_owner from public.scores s where s.match_id = p_match_id;
  if found then
    if v_owner <> v_user_id then
      raise exception 'match_conflict' using errcode = '23505';
    end if;
    select b.score, b.match_id = p_match_id into v_best, v_is_new_best
      from public.best_scores b
      where b.board = p_board and b.user_id = v_user_id;
    return jsonb_build_object(
      'match_id', p_match_id,
      'is_new_best', coalesce(v_is_new_best, false),
      'best_score', v_best,
      'unlocked_cosmetics', '[]'::jsonb);
  end if;

  select jsonb_object_agg(r.key, r.value) into v_rules from public.game_rules r;

  if (select count(*) from public.scores s
      where s.user_id = v_user_id and s.created_at > now() - interval '60 seconds')
     >= (v_rules ->> 'rate_limit_per_minute')::integer then
    raise exception 'rate_limited' using errcode = '54000';
  end if;

  if p_duration_ms not between (v_rules ->> 'min_duration_ms')::integer
                           and (v_rules ->> 'max_duration_ms')::integer then
    raise exception 'implausible_duration' using errcode = '22023';
  end if;

  if p_score > floor(p_duration_ms / 1000.0 * (v_rules ->> 'max_points_per_second')::numeric) then
    raise exception 'implausible_score' using errcode = '22023';
  end if;

  if not (v_rules -> 'accepted_content_versions') ? p_content_version then
    raise exception 'unknown_content_version' using errcode = '22023';
  end if;

  insert into public.scores
    (match_id, user_id, board, score, duration_ms, seed, content_version, origin)
  values
    (p_match_id, v_user_id, p_board, p_score, p_duration_ms, p_seed, p_content_version, p_origin);

  select b.score into v_previous_best
    from public.best_scores b
    where b.board = p_board and b.user_id = v_user_id;

  v_is_new_best := v_previous_best is null or p_score > v_previous_best;
  if v_is_new_best then
    insert into public.best_scores (board, user_id, score, match_id, achieved_at)
    values (p_board, v_user_id, p_score, p_match_id, now())
    on conflict (board, user_id) do update
      set score = excluded.score, match_id = excluded.match_id, achieved_at = excluded.achieved_at;
  end if;
  v_best := greatest(p_score, v_previous_best);

  update public.player_stats
    set matches_played = matches_played + 1,
        total_score = total_score + p_score,
        orders_completed = orders_completed + p_orders_completed,
        play_time_ms = play_time_ms + p_duration_ms
    where user_id = v_user_id;

  select max(b.score) into v_personal_best from public.best_scores b where b.user_id = v_user_id;

  with inserted as (
    insert into public.user_cosmetics (user_id, cosmetic_id)
    select v_user_id, u.key
      from jsonb_each_text(v_rules -> 'cosmetic_unlocks') u
      where u.value::integer <= v_personal_best
    on conflict (user_id, cosmetic_id) do nothing
    returning cosmetic_id
  )
  select coalesce(array_agg(cosmetic_id order by cosmetic_id), '{}') into v_unlocked from inserted;

  return jsonb_build_object(
    'match_id', p_match_id,
    'is_new_best', v_is_new_best,
    'best_score', v_best,
    'unlocked_cosmetics', to_jsonb(v_unlocked));
end;
$$;

revoke execute on function public.submit_score(uuid, text, integer, integer, bigint, text, text, integer)
  from public, anon;
grant execute on function public.submit_score(uuid, text, integer, integer, bigint, text, text, integer)
  to authenticated;
