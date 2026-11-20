-- Letter Loom scoreboard. Paste this whole file into the Supabase SQL editor and run it once.
--
-- The table is closed to the public: with row level security on and no policies, the public key can't
-- read or write it directly. Players go through two functions instead:
--   leaderboard(max_rows)  read the top scores (no secrets)
--   submit_score(...)      create or update your own row; each phone holds a secret token, and only
--                          the phone with the matching token can update that row

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.scores (
  player_id  uuid primary key,
  token_hash text not null,
  name       text not null check (char_length(name) between 1 and 24),
  levels     int  not null default 0 check (levels between 0 and 1000),
  words      int  not null default 0 check (words between 0 and 1000000),
  updated_at timestamptz not null default now()
);

alter table public.scores enable row level security;

create or replace function public.leaderboard(max_rows int default 50)
returns table (player_id uuid, name text, levels int, words int, updated_at timestamptz)
language sql stable security definer set search_path = public as $$
  select s.player_id, s.name, s.levels, s.words, s.updated_at
  from public.scores s
  order by s.levels desc, s.words desc, s.updated_at asc
  limit least(greatest(coalesce(max_rows, 50), 1), 100);
$$;

create or replace function public.submit_score(p_player uuid, p_token text, p_name text, p_levels int, p_words int)
returns void
language plpgsql security definer set search_path = public, extensions as $$
declare
  stored text;
  hashed text;
begin
  if p_token is null or char_length(p_token) < 32 then raise exception 'invalid token'; end if;
  p_name := btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g'));
  if char_length(p_name) not between 1 and 24 then raise exception 'name must be 1 to 24 characters'; end if;
  if p_levels not between 0 and 1000 or p_words not between 0 and 1000000 then raise exception 'invalid score'; end if;

  hashed := encode(digest(p_token, 'sha256'), 'hex');
  select token_hash into stored from public.scores where player_id = p_player;

  if stored is null then
    insert into public.scores (player_id, token_hash, name, levels, words)
    values (p_player, hashed, p_name, p_levels, p_words);
  elsif stored = hashed then
    update public.scores
    set name = p_name, levels = p_levels, words = p_words, updated_at = now()
    where player_id = p_player;
  else
    raise exception 'this score belongs to another player';
  end if;
end;
$$;

revoke all on function public.leaderboard(int) from public;
revoke all on function public.submit_score(uuid, text, text, int, int) from public;
grant execute on function public.leaderboard(int) to anon, authenticated;
grant execute on function public.submit_score(uuid, text, text, int, int) to anon, authenticated;
