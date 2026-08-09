-- ============================================================
-- Talk & Learn: English Tutor — Supabase schema
-- Run this in Supabase SQL Editor (or via `supabase db push`)
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'student' check (role in ('student', 'teacher')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Teachers can view student profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'teacher'
    )
  );

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  level text default 'beginner' check (level in ('beginner', 'intermediate', 'advanced')),
  content jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.lessons enable row level security;

create policy "Anyone signed in can view lessons"
  on public.lessons for select
  using (auth.uid() is not null);

create policy "Teachers can create lessons"
  on public.lessons for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher')
  );

create policy "Teachers can update their own lessons"
  on public.lessons for update
  using (created_by = auth.uid());

create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.profiles(id) not null,
  lesson_id uuid references public.lessons(id) not null,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  score numeric,
  transcript jsonb default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  unique (student_id, lesson_id)
);

alter table public.progress enable row level security;

create policy "Students can view their own progress"
  on public.progress for select
  using (student_id = auth.uid());

create policy "Teachers can view all student progress"
  on public.progress for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher')
  );

create policy "Students can upsert their own progress"
  on public.progress for insert
  with check (student_id = auth.uid());

create policy "Students can update their own progress"
  on public.progress for update
  using (student_id = auth.uid());

insert into public.lessons (title, description, level, content)
values
  ('Ordering at a Café', 'Practice speaking phrases for ordering food and drinks.', 'beginner',
   '{"steps": ["Greet the barista", "Ask for a menu item", "Ask the price", "Say thank you and goodbye"]}'::jsonb),
  ('Talking About Your Day', 'Practice past tense in casual conversation.', 'beginner',
   '{"steps": ["Describe morning routine", "Describe one event", "Say how you felt about it"]}'::jsonb)
on conflict do nothing;
