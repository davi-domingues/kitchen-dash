-- KD-30 (#24): schema base e RLS (SYSTEM_DESIGN §5 e §6.1).
-- Escrita em scores, best_scores, player_stats e user_cosmetics só por RPC (KD-31),
-- por isso estas tabelas não recebem grant nem policy de insert/update/delete.

-- Os grants padrão do Supabase dão tudo a anon/authenticated; cada tabela abaixo
-- revoga e concede só o que a §6.1 permite.

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null unique
    constraint profiles_display_name_format
    check (display_name ~ '^[A-Za-z0-9_]{3,20}$'),
  settings jsonb not null default '{}'::jsonb,
  equipped jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;

-- anon só enxerga as colunas públicas (via public_profiles).
grant select (id, display_name, equipped) on public.profiles to anon;
grant select on public.profiles to authenticated;
grant update (display_name, settings, equipped) on public.profiles to authenticated;

create policy "profiles: leitura pública das colunas permitidas"
  on public.profiles for select to anon
  using (true);

-- authenticated lê todas as linhas porque o ranking mostra nomes de outros
-- jogadores; settings só guarda preferências não sensíveis (ver ESTUDOS_E_DECISOES).
create policy "profiles: leitura por autenticados"
  on public.profiles for select to authenticated
  using (true);

create policy "profiles: atualiza a própria linha"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create view public.public_profiles
  with (security_invoker = true)
  as select id, display_name, equipped from public.profiles;

revoke all on public.public_profiles from anon, authenticated;
grant select on public.public_profiles to anon, authenticated;

-- ---------------------------------------------------------------------------
-- scores (retenção de 90 dias, job fica para a KD de retenção)
-- ---------------------------------------------------------------------------
create table public.scores (
  id bigint generated always as identity primary key,
  match_id uuid not null unique,
  user_id uuid not null references public.profiles (id) on delete cascade,
  board text not null default 'global'
    constraint scores_board_format check (board ~ '^[a-z0-9_-]{1,40}$'),
  score integer not null check (score >= 0),
  duration_ms integer not null check (duration_ms > 0),
  seed bigint not null,
  content_version text not null,
  origin text not null check (origin in ('online', 'local')),
  created_at timestamptz not null default now()
);

create index scores_user_id_created_at_idx on public.scores (user_id, created_at desc);
create index scores_created_at_idx on public.scores (created_at);

alter table public.scores enable row level security;
revoke all on public.scores from anon, authenticated;
grant select on public.scores to authenticated;

create policy "scores: lê as próprias linhas"
  on public.scores for select to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- best_scores
-- ---------------------------------------------------------------------------
-- match_id não tem FK para scores: scores expira em 90 dias e o recorde fica.
create table public.best_scores (
  board text not null
    constraint best_scores_board_format check (board ~ '^[a-z0-9_-]{1,40}$'),
  user_id uuid not null references public.profiles (id) on delete cascade,
  score integer not null check (score >= 0),
  match_id uuid not null,
  achieved_at timestamptz not null default now(),
  primary key (board, user_id)
);

create index best_scores_ranking_idx on public.best_scores (board, score desc, achieved_at);
create index best_scores_user_id_idx on public.best_scores (user_id);

alter table public.best_scores enable row level security;
revoke all on public.best_scores from anon, authenticated;
grant select on public.best_scores to anon, authenticated;

create policy "best_scores: leitura pública"
  on public.best_scores for select to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- player_stats
-- ---------------------------------------------------------------------------
create table public.player_stats (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  matches_played integer not null default 0 check (matches_played >= 0),
  total_score bigint not null default 0 check (total_score >= 0),
  orders_completed integer not null default 0 check (orders_completed >= 0),
  play_time_ms bigint not null default 0 check (play_time_ms >= 0)
);

alter table public.player_stats enable row level security;
revoke all on public.player_stats from anon, authenticated;
grant select on public.player_stats to authenticated;

create policy "player_stats: lê a própria linha"
  on public.player_stats for select to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- user_cosmetics (catálogo em content/cosmetics.json)
-- ---------------------------------------------------------------------------
create table public.user_cosmetics (
  user_id uuid not null references public.profiles (id) on delete cascade,
  cosmetic_id text not null,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, cosmetic_id)
);

alter table public.user_cosmetics enable row level security;
revoke all on public.user_cosmetics from anon, authenticated;
grant select on public.user_cosmetics to authenticated;

create policy "user_cosmetics: lê as próprias linhas"
  on public.user_cosmetics for select to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- game_rules (constantes de plausibilidade lidas pelas RPCs, §6.2)
-- ---------------------------------------------------------------------------
create table public.game_rules (
  key text primary key,
  value jsonb not null,
  description text not null
);

alter table public.game_rules enable row level security;
revoke all on public.game_rules from anon, authenticated;
grant select on public.game_rules to anon, authenticated;

create policy "game_rules: leitura pública"
  on public.game_rules for select to anon, authenticated
  using (true);

-- Valores provisórios: max_points_per_second é ajustado quando a KD-14 fechar
-- (PLANO_MVP). Turno de 3 minutos (PRD).
insert into public.game_rules (key, value, description) values
  ('min_duration_ms', '170000', 'Duração mínima aceita de uma partida'),
  ('max_duration_ms', '200000', 'Duração máxima aceita de uma partida'),
  ('max_points_per_second', '10', 'Teto de pontos por segundo (provisório até a KD-14)'),
  ('accepted_content_versions', '["1"]', 'Versões de conteúdo aceitas no envio'),
  ('rate_limit_per_minute', '10', 'Envios de pontuação por usuário em 60 s');

-- ---------------------------------------------------------------------------
-- Trigger: cria profile e player_stats no cadastro
-- ---------------------------------------------------------------------------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, 'player_' || substr(replace(new.id::text, '-', ''), 1, 12));

  insert into public.player_stats (user_id) values (new.id);

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
