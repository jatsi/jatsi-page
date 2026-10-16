-- Jatsi Universe · Supabase schema
-- Ejecuta el archivo completo una sola vez desde Supabase > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Explorador' check (char_length(display_name) between 1 and 50),
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  type text not null check (type in ('wheel', 'poll', 'message', 'either', 'oracle', 'question')),
  title text not null check (char_length(title) between 2 and 100),
  description text not null default '' check (char_length(description) <= 500),
  config jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.interactions (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  visitor_id uuid,
  kind text not null check (kind in ('wheel', 'poll', 'message', 'either', 'oracle', 'question')),
  payload jsonb not null default '{}'::jsonb check (octet_length(payload::text) <= 5000),
  created_at timestamptz not null default now()
);

create index if not exists interactions_activity_created_idx on public.interactions(activity_id, created_at desc);
create index if not exists interactions_user_created_idx on public.interactions(user_id, created_at desc);
create index if not exists interactions_kind_created_idx on public.interactions(kind, created_at desc);
create index if not exists activities_active_created_idx on public.activities(is_active, created_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists activities_touch_updated_at on public.activities;
create trigger activities_touch_updated_at before update on public.activities
for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(new.email, '@', 1), 'Explorador')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.profiles enable row level security;
alter table public.activities enable row level security;
alter table public.interactions enable row level security;

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id or (select public.is_admin()));

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "activities_public_read_active" on public.activities;
create policy "activities_public_read_active"
on public.activities for select
to anon, authenticated
using (is_active = true or (select public.is_admin()));

drop policy if exists "activities_admin_insert" on public.activities;
create policy "activities_admin_insert"
on public.activities for insert
to authenticated
with check ((select public.is_admin()) and created_by = (select auth.uid()));

drop policy if exists "activities_admin_update" on public.activities;
create policy "activities_admin_update"
on public.activities for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "activities_admin_delete" on public.activities;
create policy "activities_admin_delete"
on public.activities for delete
to authenticated
using ((select public.is_admin()));

drop policy if exists "interactions_insert_public" on public.interactions;
create policy "interactions_insert_public"
on public.interactions for insert
to anon, authenticated
with check (
  exists (
    select 1 from public.activities a
    where a.id = activity_id and a.is_active = true and a.type = kind
  )
  and (
    user_id is null
    or ((select auth.uid()) is not null and user_id = (select auth.uid()))
  )
);

drop policy if exists "interactions_select_self_or_admin" on public.interactions;
create policy "interactions_select_self_or_admin"
on public.interactions for select
to authenticated
using (user_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "interactions_admin_delete" on public.interactions;
create policy "interactions_admin_delete"
on public.interactions for delete
to authenticated
using ((select public.is_admin()));

-- Limita los permisos de la API además de las políticas RLS.
revoke all on public.profiles from anon, authenticated;
revoke all on public.activities from anon, authenticated;
revoke all on public.interactions from anon, authenticated;

grant select on public.activities to anon, authenticated;
grant insert, update, delete on public.activities to authenticated;
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;
grant insert on public.interactions to anon, authenticated;
grant select, delete on public.interactions to authenticated;

-- Actividades iniciales que coinciden con los enlaces de la página.
insert into public.activities (id, slug, type, title, description, config)
values
  ('11111111-1111-4111-8111-111111111111', 'ruleta-cosmica', 'wheel', 'Ruleta cósmica', 'El universo elige el reto del próximo stream.', '{"options":["Cantar una canción","Reto sin reír","Chat elige el juego","Historia vergonzosa","Imitar a Katsy","Sorpresa del cosmos"]}'),
  ('22222222-2222-4222-8222-222222222222', 'proximo-stream', 'poll', '¿Qué hacemos en el próximo stream?', 'Tu voto ayuda a diseñar la siguiente aventura.', '{"options":["Noche de terror","Tier list de anime","Just chatting","Juego con la comunidad"]}'),
  ('33333333-3333-4333-8333-333333333333', 'buzon-secreto', 'message', 'Buzón secreto', 'Comparte una confesión, un pensamiento o algo que quieras decirle a Jatsi.', '{"placeholder":"Escribe desde el corazón…","max_length":600}'),
  ('44444444-4444-4444-8444-444444444444', 'esto-o-aquello', 'either', 'Esto o aquello', 'No lo pienses demasiado. Elige tu lado.', '{"options":["Anime toda la noche","Gaming hasta el amanecer"]}'),
  ('55555555-5555-4555-8555-555555555555', 'oraculo-katsy', 'oracle', 'Oráculo de Katsy', 'Una señal bonita del universo, solo para ti.', '{"options":["Tu ritmo también es progreso.","Algo bonito ya viene en camino.","Hoy confía en tu intuición.","No tienes que poder con todo a la vez.","Tu rareza es parte de tu luz.","Esa idea merece una oportunidad."]}'),
  ('66666666-6666-4666-8666-666666666666', 'pregunta-estelar', 'question', 'Pregunta estelar', 'Deja una pregunta para el próximo Q&A.', '{"placeholder":"¿Qué siempre quisiste preguntarle a Jatsi?","max_length":400}')
on conflict (slug) do nothing;

-- Realtime: ignora el error si la tabla ya fue agregada.
do $$
begin
  alter publication supabase_realtime add table public.interactions;
exception
  when duplicate_object then null;
end $$;

-- IMPORTANTE:
-- Después de crear tu cuenta en la web, conviértela en administradora.
-- Sustituye el correo y ejecuta SOLO estas dos líneas:
--
-- update public.profiles
-- set role = 'admin'
-- where id = (select id from auth.users where email = 'TU-CORREO@EJEMPLO.COM');
