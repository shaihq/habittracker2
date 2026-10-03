-- HabitKit initial schema: profiles, habits, habit_completions + RLS.
-- Run once in the Supabase SQL Editor (or `supabase db push`).

-- ─────────────────────────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  name        text not null default '',
  created_at  timestamptz not null default now()
);

-- Create a profile row automatically whenever a user signs up.
-- `name` comes from the metadata passed to supabase.auth.signUp().
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- habits
-- ─────────────────────────────────────────────────────────────
create table public.habits (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name         text not null check (char_length(name) between 1 and 40),
  description  text check (char_length(description) <= 80),
  color        text not null check (color ~ '^#[0-9A-Fa-f]{6}$'),
  frequency    text not null default 'daily' check (frequency in ('daily', '3_per_week', '5_per_week')),
  created_at   timestamptz not null default now()
);

create index habits_user_id_idx on public.habits (user_id, created_at);

-- ─────────────────────────────────────────────────────────────
-- habit_completions (one row per habit per calendar day)
-- ─────────────────────────────────────────────────────────────
create table public.habit_completions (
  id            uuid primary key default gen_random_uuid(),
  habit_id      uuid not null references public.habits (id) on delete cascade,
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  completed_on  date not null,
  created_at    timestamptz not null default now(),
  unique (habit_id, completed_on)
);

create index habit_completions_user_idx on public.habit_completions (user_id, completed_on);

-- ─────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────
alter table public.profiles          enable row level security;
alter table public.habits            enable row level security;
alter table public.habit_completions enable row level security;

-- profiles: read + update own (insert handled by the trigger above)
create policy "Read own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

create policy "Update own profile" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- habits: full CRUD on own rows
create policy "Read own habits" on public.habits
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "Create own habits" on public.habits
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "Update own habits" on public.habits
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Delete own habits" on public.habits
  for delete to authenticated using ((select auth.uid()) = user_id);

-- habit_completions: read / create / delete own rows.
-- Inserts must also point at a habit the user owns.
create policy "Read own completions" on public.habit_completions
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "Create own completions" on public.habit_completions
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.habits h
      where h.id = habit_id and h.user_id = (select auth.uid())
    )
  );

create policy "Delete own completions" on public.habit_completions
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Table privileges: signed-in users only; anon gets nothing.
revoke all on public.profiles, public.habits, public.habit_completions from anon;
grant select, update                 on public.profiles          to authenticated;
grant select, insert, update, delete on public.habits            to authenticated;
grant select, insert, delete         on public.habit_completions to authenticated;
