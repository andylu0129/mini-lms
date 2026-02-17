create table public.consultations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  reason text not null,
  scheduled_at timestamptz not null,
  is_completed boolean,
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

-- Prevent created_at from being modified on update.
create or replace function public.preserve_created_at()
returns trigger as $$
begin
  new.created_at := old.created_at;
  return new;
end;
$$ language plpgsql;

create trigger trg_preserve_consultations_created_at
before update on public.consultations
for each row
execute function public.preserve_created_at();

-- PL/pgSQL function to compute the derived status of consultation rows.
create or replace function get_consultation_status(consultation consultations)
returns text as $$
begin
  return case
    when consultation.is_completed = true then 'complete'
    when consultation.is_completed = false then 'incomplete'
    when consultation.scheduled_at > now() then 'upcoming'
    else 'pending'
  end;
end;
$$ language plpgsql stable;

-- View to include derived status for each consultation row.
create or replace view consultations_with_status as
select *,
       get_consultation_status(consultations.*) as status
from consultations;

-- PL/pgSQL function to compute consultation counts based on status.
create or replace function get_consultation_counts_by_status(user_id uuid)
returns table(
  total_count int,
  complete_count int,
  incomplete_count int,
  upcoming_count int,
  pending_count int
) as $$
begin
  return query
  select
    count(*)::int as total_count,
    count(*) filter (where get_consultation_status(consultation.*) = 'complete')::int as complete_count,
    count(*) filter (where get_consultation_status(consultation.*) = 'incomplete')::int as incomplete_count,
    count(*) filter (where get_consultation_status(consultation.*) = 'upcoming')::int as upcoming_count,
    count(*) filter (where get_consultation_status(consultation.*) = 'pending')::int as pending_count
  from consultations as consultation
  where consultation.user_id = get_consultation_counts_by_status.user_id;
end;
$$ language plpgsql stable;
