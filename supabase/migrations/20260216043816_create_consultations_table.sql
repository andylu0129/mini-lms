create table public.consultations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  reason text not null,
  scheduled_at timestamptz not null,
  is_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_consultations_user_id on public.consultations(user_id);
create index idx_consultations_scheduled_at on public.consultations(scheduled_at);

alter table public.consultations enable row level security;

create policy "Users can view their consultations"
on public.consultations
for select
using (user_id = auth.uid());

create policy "Users can insert their consultations"
on public.consultations
for insert
with check (user_id = auth.uid());

create policy "Users can update their consultations"
on public.consultations
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());