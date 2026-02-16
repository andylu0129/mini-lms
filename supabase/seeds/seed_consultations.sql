
-- Bypass RLS for seed data.
SET session_replication_role = replica;

insert into public.consultations (user_id, first_name, last_name, reason, scheduled_at, is_completed)
values
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'John', 'Doe', 'Struggling with algebra fundamentals and need help preparing for the upcoming midterm exam.', now() + interval '1 day', false),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'John', 'Doe', 'Discussed study strategies and time management techniques.', now() - interval '3 days', true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'John', 'Doe', 'Reviewed and provided feedback on research paper outline.', now() - interval '5 days', true),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Bob', 'Smith', 'Need guidance on my final year capstone project topic selection.', now() + interval '2 days', false),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Bob', 'Smith', 'Having difficulty understanding organic chemistry reaction mechanisms.', now() + interval '5 days', false),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Bob', 'Smith', 'Helped with understanding statistical analysis methods for thesis.', now() - interval '10 days', true),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Carol', 'Williams', 'Want to review essay draft for English Literature class before submission deadline.', now() + interval '3 days', false),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Carol', 'Williams', 'Looking for advice on course selection for next semester.', now() + interval '7 days', false);

-- Resume RLS.
SET session_replication_role = origin;
