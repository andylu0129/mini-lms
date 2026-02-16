
-- Bypass RLS for seed data.
SET session_replication_role = replica;

insert into public.consultations (user_id, first_name, last_name, reason, scheduled_at, is_completed)
values
  ('3286483b-0a35-4cf3-be1d-bfaa8badddc3', 'John', 'Doe', 'Struggling with algebra fundamentals and need help preparing for the upcoming midterm exam.', now() + interval '1 day', false),
  ('3286483b-0a35-4cf3-be1d-bfaa8badddc3', 'John', 'Doe', 'Discussed study strategies and time management techniques.', now() - interval '3 days', true),
  ('3286483b-0a35-4cf3-be1d-bfaa8badddc3', 'John', 'Doe', 'Reviewed and provided feedback on research paper outline.', now() - interval '5 days', true),
  ('3286483b-0a35-4cf3-be1d-bfaa8badddc3', 'Bob', 'Smith', 'Need guidance on my final year capstone project topic selection.', now() + interval '2 days', false),
  ('3286483b-0a35-4cf3-be1d-bfaa8badddc3', 'Bob', 'Smith', 'Having difficulty understanding organic chemistry reaction mechanisms.', now() + interval '5 days', false),
  ('3286483b-0a35-4cf3-be1d-bfaa8badddc3', 'Bob', 'Smith', 'Helped with understanding statistical analysis methods for thesis.', now() - interval '10 days', true),
  ('3286483b-0a35-4cf3-be1d-bfaa8badddc3', 'Carol', 'Williams', 'Want to review essay draft for English Literature class before submission deadline.', now() + interval '3 days', false),
  ('3286483b-0a35-4cf3-be1d-bfaa8badddc3', 'Carol', 'Williams', 'Looking for advice on course selection for next semester.', now() + interval '7 days', false);

-- Resume RLS.
SET session_replication_role = origin;
