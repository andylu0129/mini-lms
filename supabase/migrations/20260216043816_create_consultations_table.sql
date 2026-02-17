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
CREATE OR REPLACE FUNCTION get_consultation_status(consultation consultations)
RETURNS TEXT AS $$
BEGIN
    RETURN CASE
        WHEN consultation.is_completed = TRUE THEN 'complete'
        WHEN consultation.is_completed = FALSE THEN 'incomplete'
        WHEN consultation.scheduled_at > NOW() THEN 'upcoming'
        ELSE 'pending'
    END;
END;
$$ LANGUAGE plpgsql STABLE;

-- View to include derived status for each consultation row.
CREATE OR REPLACE VIEW consultations_with_status AS
SELECT *,
       get_consultation_status(consultations.*) AS status
FROM consultations;

-- PL/pgSQL function to compute consultation counts based on status.
 CREATE OR REPLACE FUNCTION get_consultation_counts_by_status(user_id UUID)
  RETURNS TABLE(
      total_count INT,
      complete_count INT,
      incomplete_count INT,
      upcoming_count INT,
      pending_count INT
  ) AS $$
  BEGIN
      RETURN QUERY
      SELECT
          COUNT(*)::INT AS total_count,
          COUNT(*) FILTER (WHERE get_consultation_status(consultation.*) = 'complete')::INT AS complete_count,
          COUNT(*) FILTER (WHERE get_consultation_status(consultation.*) = 'incomplete')::INT AS incomplete_count,
          COUNT(*) FILTER (WHERE get_consultation_status(consultation.*) = 'upcoming')::INT AS upcoming_count,
          COUNT(*) FILTER (WHERE get_consultation_status(consultation.*) = 'pending')::INT AS pending_count
      FROM consultations AS consultation
      WHERE consultation.user_id = get_consultation_counts_by_status.user_id;
  END;
  $$ LANGUAGE plpgsql STABLE;
