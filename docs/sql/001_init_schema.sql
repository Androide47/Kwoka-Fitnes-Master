-- Kwoka Fitness — test environment schema (PostgreSQL 16)
-- Source of truth for mobile + landing shared backend.
-- Apply: psql "$DATABASE_URL" -f docs/sql/001_init_schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

CREATE TYPE user_role AS ENUM ('client', 'trainer', 'admin');
CREATE TYPE fitness_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE media_purpose AS ENUM (
  'avatar',
  'progress-photo',
  'message-attachment',
  'exercise-media',
  'blog-cover',
  'other'
);
CREATE TYPE media_status AS ENUM ('pending', 'ready', 'failed', 'deleted');
CREATE TYPE media_kind AS ENUM ('image', 'video', 'document');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE progress_entry_type AS ENUM ('photo', 'measurement', 'note');
CREATE TYPE product_type AS ENUM ('physical', 'digital', 'session_package', 'subscription');
CREATE TYPE order_status AS ENUM ('draft', 'pending_payment', 'paid', 'cancelled', 'refunded');
CREATE TYPE payment_provider AS ENUM ('stripe', 'paypal', 'demo');
CREATE TYPE credit_ledger_reason AS ENUM (
  'order_grant',
  'booking_spend',
  'booking_refund',
  'admin_adjust',
  'expiry'
);
CREATE TYPE notification_type AS ENUM (
  'message',
  'workout',
  'appointment',
  'streak',
  'broadcast',
  'system'
);
CREATE TYPE workout_completion_status AS ENUM ('finished', 'unfinished', 'missed');

-- ---------------------------------------------------------------------------
-- Identity
-- ---------------------------------------------------------------------------

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cognito_sub     TEXT UNIQUE,
  email           CITEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  role            user_role NOT NULL,
  avatar_media_id UUID,
  email_verified_at TIMESTAMPTZ,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Federated / local sign-in methods linked to one profile (Facebook/Meta, password, …)
CREATE TABLE user_identities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider        TEXT NOT NULL, -- password | facebook | google | apple | …
  provider_subject TEXT NOT NULL, -- Cognito username or IdP subject
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, provider_subject)
);

CREATE INDEX idx_user_identities_user ON user_identities(user_id);

CREATE TABLE client_profiles (
  user_id              UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  height_in            NUMERIC(6,2),
  weight_lb            NUMERIC(6,2),
  fitness_level        fitness_level,
  goals                TEXT[] NOT NULL DEFAULT '{}',
  medical_conditions   TEXT[] NOT NULL DEFAULT '{}',
  streak_count         INT NOT NULL DEFAULT 0,
  last_check_in        TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE trainer_profiles (
  user_id          UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio              TEXT,
  experience       TEXT,
  specialties      TEXT[] NOT NULL DEFAULT '{}',
  certifications   TEXT[] NOT NULL DEFAULT '{}',
  -- {"monday":["09:00-12:00","14:00-18:00"], ...}
  availability     JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE trainer_client_links (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (trainer_id, client_id)
);

CREATE INDEX idx_tcl_trainer ON trainer_client_links(trainer_id) WHERE is_active;
CREATE INDEX idx_tcl_client ON trainer_client_links(client_id) WHERE is_active;

-- ---------------------------------------------------------------------------
-- Media
-- ---------------------------------------------------------------------------

CREATE TABLE media_files (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose         media_purpose NOT NULL,
  kind            media_kind NOT NULL,
  status          media_status NOT NULL DEFAULT 'pending',
  s3_bucket       TEXT NOT NULL,
  s3_key          TEXT NOT NULL,
  content_type    TEXT NOT NULL,
  byte_size       BIGINT,
  original_name   TEXT,
  thumbnail_key   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ready_at        TIMESTAMPTZ,
  deleted_at      TIMESTAMPTZ,
  UNIQUE (s3_bucket, s3_key)
);

CREATE INDEX idx_media_owner ON media_files(owner_user_id);

ALTER TABLE users
  ADD CONSTRAINT users_avatar_media_fk
  FOREIGN KEY (avatar_media_id) REFERENCES media_files(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- Workout ecosystem
-- ---------------------------------------------------------------------------

CREATE TABLE exercises (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  category     TEXT NOT NULL,
  equipment    TEXT[] NOT NULL DEFAULT '{}',
  difficulty   fitness_level NOT NULL DEFAULT 'beginner',
  image_media_id UUID REFERENCES media_files(id) ON DELETE SET NULL,
  video_media_id UUID REFERENCES media_files(id) ON DELETE SET NULL,
  created_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  is_library   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at   TIMESTAMPTZ
);

CREATE TABLE workouts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  created_by    UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  client_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  template_id   UUID REFERENCES workouts(id) ON DELETE SET NULL,
  duration_min  INT NOT NULL DEFAULT 30,
  difficulty    fitness_level NOT NULL DEFAULT 'beginner',
  scheduled_for DATE,
  is_template   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

CREATE INDEX idx_workouts_client_day ON workouts(client_id, scheduled_for);
CREATE INDEX idx_workouts_created_by ON workouts(created_by);

CREATE TABLE workout_exercises (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id   UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id  UUID NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
  sort_order   INT NOT NULL DEFAULT 0,
  group_label  TEXT,
  sets         INT,
  reps         INT,
  duration_sec INT,
  weight_lb    NUMERIC(8,2),
  rest_sec     INT,
  notes        TEXT,
  UNIQUE (workout_id, sort_order)
);

CREATE TABLE workout_plans (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  client_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trainer_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_date   DATE NOT NULL,
  end_date     DATE,
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  -- {"monday":["uuid",...], ...}
  workouts_by_day JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE routine_assignments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workout_id   UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  template_id  UUID REFERENCES workouts(id) ON DELETE SET NULL,
  assigned_by  UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  name         TEXT NOT NULL,
  assign_date  DATE NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_routine_client_date ON routine_assignments(client_id, assign_date);

CREATE TABLE workout_completions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id      UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  client_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status          workout_completion_status NOT NULL,
  completed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_exercise_ids UUID[] NOT NULL DEFAULT '{}',
  UNIQUE (workout_id, client_id, completed_at)
);

CREATE TABLE exercise_feedback (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id   UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id  UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  client_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment      TEXT NOT NULL DEFAULT '',
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workout_id, exercise_id, client_id)
);

CREATE TABLE exercise_feedback_media (
  feedback_id  UUID NOT NULL REFERENCES exercise_feedback(id) ON DELETE CASCADE,
  media_id     UUID NOT NULL REFERENCES media_files(id) ON DELETE CASCADE,
  PRIMARY KEY (feedback_id, media_id)
);

-- ---------------------------------------------------------------------------
-- Calendar / bookings (shared landing + mobile)
-- ---------------------------------------------------------------------------

CREATE TABLE appointments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  start_at     TIMESTAMPTZ NOT NULL,
  end_at       TIMESTAMPTZ NOT NULL,
  status       appointment_status NOT NULL DEFAULT 'pending',
  location     TEXT,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_at > start_at)
);

CREATE INDEX idx_appt_trainer_range ON appointments(trainer_id, start_at, end_at);
CREATE INDEX idx_appt_client_range ON appointments(client_id, start_at, end_at);
CREATE INDEX idx_appt_status ON appointments(status);

CREATE TABLE blocked_times (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_at     TIMESTAMPTZ NOT NULL,
  end_at       TIMESTAMPTZ NOT NULL,
  is_full_day  BOOLEAN NOT NULL DEFAULT FALSE,
  reason       TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_at > start_at)
);

CREATE INDEX idx_blocked_trainer ON blocked_times(trainer_id, start_at, end_at);

-- ---------------------------------------------------------------------------
-- Progress
-- ---------------------------------------------------------------------------

CREATE TABLE progress_entries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_type   progress_entry_type NOT NULL,
  entry_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes        TEXT,
  -- US customary: lb / in (matches mobile types)
  weight_lb    NUMERIC(6,2),
  body_fat_pct NUMERIC(5,2),
  chest_in     NUMERIC(6,2),
  waist_in     NUMERIC(6,2),
  hips_in      NUMERIC(6,2),
  arms_in      NUMERIC(6,2),
  thighs_in    NUMERIC(6,2),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_progress_client ON progress_entries(client_id, entry_at DESC);

CREATE TABLE progress_entry_media (
  entry_id  UUID NOT NULL REFERENCES progress_entries(id) ON DELETE CASCADE,
  media_id  UUID NOT NULL REFERENCES media_files(id) ON DELETE CASCADE,
  PRIMARY KEY (entry_id, media_id)
);

-- ---------------------------------------------------------------------------
-- Messaging
-- ---------------------------------------------------------------------------

CREATE TABLE messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content      TEXT NOT NULL DEFAULT '',
  sent_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at      TIMESTAMPTZ,
  is_broadcast BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at   TIMESTAMPTZ
);

CREATE INDEX idx_messages_pair ON messages(
  LEAST(sender_id, receiver_id),
  GREATEST(sender_id, receiver_id),
  sent_at DESC
);
CREATE INDEX idx_messages_receiver_unread ON messages(receiver_id) WHERE read_at IS NULL;

CREATE TABLE message_attachments (
  message_id  UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  media_id    UUID NOT NULL REFERENCES media_files(id) ON DELETE CASCADE,
  PRIMARY KEY (message_id, media_id)
);

-- ---------------------------------------------------------------------------
-- Commerce
-- ---------------------------------------------------------------------------

CREATE TABLE products (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  description      TEXT NOT NULL DEFAULT '',
  category         TEXT NOT NULL DEFAULT 'general',
  product_type     product_type NOT NULL,
  price_cents      INT NOT NULL CHECK (price_cents >= 0),
  session_credits  INT,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

CREATE TABLE orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id) ON DELETE SET NULL,
  email             CITEXT NOT NULL,
  customer_name     TEXT NOT NULL,
  shipping_address  TEXT,
  payment_provider  payment_provider NOT NULL DEFAULT 'demo',
  status            order_status NOT NULL DEFAULT 'draft',
  total_cents       INT NOT NULL DEFAULT 0,
  external_ref      TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at           TIMESTAMPTZ,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id, created_at DESC);
CREATE INDEX idx_orders_email ON orders(email);

CREATE TABLE order_lines (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                  UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id                UUID REFERENCES products(id) ON DELETE SET NULL,
  name                      TEXT NOT NULL,
  product_type              product_type NOT NULL,
  qty                       INT NOT NULL CHECK (qty > 0),
  unit_price_cents          INT NOT NULL,
  session_credits_granted   INT NOT NULL DEFAULT 0
);

CREATE TABLE session_credit_ledger (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  delta           INT NOT NULL,
  reason          credit_ledger_reason NOT NULL,
  order_id        UUID REFERENCES orders(id) ON DELETE SET NULL,
  appointment_id  UUID REFERENCES appointments(id) ON DELETE SET NULL,
  note            TEXT,
  period_month    CHAR(7) NOT NULL, -- YYYY-MM for monthly allowance views
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credits_user_month ON session_credit_ledger(user_id, period_month);

-- ---------------------------------------------------------------------------
-- Marketing / public forms
-- ---------------------------------------------------------------------------

CREATE TABLE contact_submissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT,
  email        CITEXT NOT NULL,
  message      TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE issue_submissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        CITEXT NOT NULL,
  category     TEXT NOT NULL,
  details      TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE newsletter_subscriptions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        CITEXT NOT NULL UNIQUE,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE blog_posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT NOT NULL UNIQUE,
  title        TEXT NOT NULL,
  excerpt      TEXT NOT NULL DEFAULT '',
  body         TEXT NOT NULL DEFAULT '',
  author_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  cover_media_id UUID REFERENCES media_files(id) ON DELETE SET NULL,
  category     TEXT,
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at   TIMESTAMPTZ
);

CREATE TABLE blog_comments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id      UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  author_name  TEXT NOT NULL,
  author_email CITEXT,
  body         TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------------

CREATE TABLE notification_preferences (
  user_id             UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  workout_reminders   BOOLEAN NOT NULL DEFAULT TRUE,
  message_alerts      BOOLEAN NOT NULL DEFAULT TRUE,
  announcements       BOOLEAN NOT NULL DEFAULT TRUE,
  email_enabled       BOOLEAN NOT NULL DEFAULT TRUE,
  push_enabled        BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE device_tokens (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform     TEXT NOT NULL, -- ios | android | web
  token        TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, token)
);

CREATE TABLE notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  message      TEXT NOT NULL,
  type         notification_type NOT NULL,
  data         JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_client_profiles_updated BEFORE UPDATE ON client_profiles
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_trainer_profiles_updated BEFORE UPDATE ON trainer_profiles
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_workouts_updated BEFORE UPDATE ON workouts
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_appointments_updated BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- Remaining session credits for a user in YYYY-MM
CREATE OR REPLACE FUNCTION session_credits_remaining(p_user UUID, p_month CHAR(7))
RETURNS INT AS $$
  SELECT COALESCE(SUM(delta), 0)::INT
  FROM session_credit_ledger
  WHERE user_id = p_user AND period_month = p_month;
$$ LANGUAGE sql STABLE;
