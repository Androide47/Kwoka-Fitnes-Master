-- Demo seed for Kwoka test environment.
-- Apply after 001_init_schema.sql.
-- Cognito subs are placeholders; link real cognito_sub on first login.

BEGIN;

-- Stable demo UUIDs
-- trainer: 11111111-1111-1111-1111-111111111111
-- clients: 2222... / 3333...

INSERT INTO users (id, email, name, role, email_verified_at, joined_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'coach@kwoka.fit', 'Kwoka Coach', 'trainer', NOW() - INTERVAL '180 days', NOW() - INTERVAL '180 days'),
  ('22222222-2222-2222-2222-222222222222', 'alex@example.com', 'Alex Client', 'client', NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days'),
  ('33333333-3333-3333-3333-333333333333', 'jordan@example.com', 'Jordan Client', 'client', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days');

INSERT INTO user_identities (user_id, provider, provider_subject) VALUES
  ('11111111-1111-1111-1111-111111111111', 'password', 'coach@kwoka.fit'),
  ('22222222-2222-2222-2222-222222222222', 'password', 'alex@example.com'),
  ('33333333-3333-3333-3333-333333333333', 'password', 'jordan@example.com');
-- Add facebook rows after first Meta login, e.g. ('…', 'facebook', '<facebook-user-id>')

INSERT INTO trainer_profiles (user_id, bio, experience, specialties, certifications, availability)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Strength and conditioning coach focused on sustainable progress.',
  '8 years',
  ARRAY['strength', 'hypertrophy', 'mobility'],
  ARRAY['NASM-CPT'],
  '{"monday":["09:00-12:00","14:00-18:00"],"wednesday":["09:00-12:00","14:00-18:00"],"friday":["09:00-17:00"]}'::jsonb
);

INSERT INTO client_profiles (user_id, height_in, weight_lb, fitness_level, goals, streak_count)
VALUES
  ('22222222-2222-2222-2222-222222222222', 70, 180, 'intermediate', ARRAY['Build strength','Improve consistency'], 5),
  ('33333333-3333-3333-3333-333333333333', 65, 140, 'beginner', ARRAY['Lose fat','Learn form'], 2);

INSERT INTO trainer_client_links (trainer_id, client_id) VALUES
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222'),
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333');

INSERT INTO notification_preferences (user_id) VALUES
  ('11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222222'),
  ('33333333-3333-3333-3333-333333333333');

INSERT INTO exercises (id, name, description, category, equipment, difficulty, is_library, created_by) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Back Squat', 'Barbell back squat to depth.', 'legs', ARRAY['barbell','rack'], 'intermediate', TRUE, '11111111-1111-1111-1111-111111111111'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'Push-Up', 'Bodyweight push-up.', 'push', ARRAY['bodyweight'], 'beginner', TRUE, '11111111-1111-1111-1111-111111111111'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'Romanian Deadlift', 'Hip-hinge posterior chain.', 'hinge', ARRAY['barbell'], 'intermediate', TRUE, '11111111-1111-1111-1111-111111111111');

INSERT INTO workouts (id, name, description, created_by, client_id, duration_min, difficulty, scheduled_for, is_template)
VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'Full Body A', 'Template full body session.', '11111111-1111-1111-1111-111111111111', NULL, 45, 'intermediate', NULL, TRUE),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'Alex Full Body A', 'Assigned copy for Alex.', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 45, 'intermediate', CURRENT_DATE + 1, FALSE);

UPDATE workouts
SET template_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'
WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2';

INSERT INTO workout_exercises (workout_id, exercise_id, sort_order, group_label, sets, reps, rest_sec) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 0, 'A', 3, 5, 120),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 1, 'B', 3, 12, 60),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 2, 'C', 3, 8, 90),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 0, 'A', 3, 5, 120),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 1, 'B', 3, 12, 60),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 2, 'C', 3, 8, 90);

INSERT INTO products (id, name, description, category, product_type, price_cents, session_credits) VALUES
  ('cccccccc-cccc-cccc-cccc-ccccccccccc1', '4-Session Pack', 'Four coaching sessions.', 'coaching', 'session_package', 19900, 4),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc2', 'Resistance Band Set', 'Physical accessory.', 'gear', 'physical', 3900, NULL),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc3', 'Form Guide PDF', 'Digital download.', 'guides', 'digital', 1500, NULL);

-- Grant Alex 4 credits for the current month (simulates paid package)
INSERT INTO session_credit_ledger (user_id, delta, reason, period_month, note)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  4,
  'order_grant',
  to_char(NOW(), 'YYYY-MM'),
  'Demo seed package'
);

INSERT INTO appointments (trainer_id, client_id, title, start_at, end_at, status)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'Training session',
  date_trunc('day', NOW() + INTERVAL '2 days') + INTERVAL '14 hours',
  date_trunc('day', NOW() + INTERVAL '2 days') + INTERVAL '15 hours',
  'confirmed'
);

INSERT INTO blog_posts (slug, title, excerpt, body, author_id, category, published_at)
VALUES (
  'welcome-to-kwoka',
  'Welcome to Kwoka',
  'How coaching, bookings, and progress tracking fit together.',
  'Full post body for the demo blog.',
  '11111111-1111-1111-1111-111111111111',
  'coaching',
  NOW()
);

COMMIT;
