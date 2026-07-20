BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_status AS ENUM ('active', 'deletion_pending', 'deleted');
CREATE TYPE content_status AS ENUM ('draft', 'in_review', 'published', 'archived', 'disabled');
CREATE TYPE session_run_status AS ENUM ('in_progress', 'completed', 'abandoned');
CREATE TYPE safety_level AS ENUM ('clear', 'caution', 'professional_review', 'urgent');

CREATE TABLE app_user (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status user_status NOT NULL DEFAULT 'active',
  locale text NOT NULL DEFAULT 'fr-FR',
  timezone text NOT NULL DEFAULT 'Europe/Paris',
  created_at timestamptz NOT NULL DEFAULT now(),
  deletion_requested_at timestamptz,
  deleted_at timestamptz
);

CREATE TABLE external_identity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_user(id) ON DELETE RESTRICT,
  issuer text NOT NULL,
  subject text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (issuer, subject)
);

CREATE TABLE sport_profile (
  user_id uuid PRIMARY KEY REFERENCES app_user(id) ON DELETE RESTRICT,
  birth_year smallint NOT NULL CHECK (birth_year BETWEEN 1900 AND 2100),
  practices text[] NOT NULL DEFAULT '{}',
  level text NOT NULL CHECK (level IN ('beginner', 'regular', 'experienced')),
  goal text NOT NULL CHECK (goal IN ('prevention', 'strength', 'return_after_break')),
  weekly_availability jsonb NOT NULL DEFAULT '{}',
  equipment text[] NOT NULL DEFAULT '{}',
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE consent_definition (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  purpose text NOT NULL,
  required boolean NOT NULL,
  published_at timestamptz NOT NULL,
  retired_at timestamptz,
  UNIQUE (code, version)
);

CREATE TABLE consent_record (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_user(id) ON DELETE RESTRICT,
  definition_id uuid NOT NULL REFERENCES consent_definition(id) ON DELETE RESTRICT,
  granted boolean NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, definition_id, recorded_at)
);
CREATE INDEX consent_record_user_time_idx ON consent_record(user_id, recorded_at DESC);

CREATE TABLE questionnaire_version (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  title text NOT NULL,
  schema jsonb NOT NULL,
  status content_status NOT NULL DEFAULT 'draft',
  validated_by text,
  validated_at timestamptz,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (code, version),
  CHECK (status <> 'published' OR (validated_by IS NOT NULL AND validated_at IS NOT NULL AND published_at IS NOT NULL))
);

CREATE TABLE questionnaire_submission (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_user(id) ON DELETE RESTRICT,
  questionnaire_version_id uuid NOT NULL REFERENCES questionnaire_version(id) ON DELETE RESTRICT,
  answers jsonb NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX questionnaire_submission_user_idx ON questionnaire_submission(user_id, submitted_at DESC);

CREATE TABLE rule_version (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  kind text NOT NULL CHECK (kind IN ('safety', 'adaptation')),
  priority integer NOT NULL,
  definition jsonb NOT NULL,
  explanation_template text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  validated_by text,
  validated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (code, version)
);

CREATE TABLE safety_decision (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_user(id) ON DELETE RESTRICT,
  submission_id uuid NOT NULL REFERENCES questionnaire_submission(id) ON DELETE RESTRICT,
  rule_version_id uuid REFERENCES rule_version(id) ON DELETE RESTRICT,
  level safety_level NOT NULL,
  reason_code text NOT NULL,
  explanation text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE exercise (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE exercise_version (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id uuid NOT NULL REFERENCES exercise(id) ON DELETE RESTRICT,
  version integer NOT NULL CHECK (version > 0),
  title text NOT NULL,
  body jsonb NOT NULL,
  status content_status NOT NULL DEFAULT 'draft',
  validated_by text,
  validated_at timestamptz,
  published_at timestamptz,
  archived_at timestamptz,
  UNIQUE (exercise_id, version),
  CHECK (status <> 'published' OR (validated_by IS NOT NULL AND validated_at IS NOT NULL AND published_at IS NOT NULL))
);
CREATE INDEX exercise_version_published_idx ON exercise_version(exercise_id, version DESC) WHERE status = 'published';

CREATE TABLE program (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_user(id) ON DELETE RESTRICT,
  status text NOT NULL CHECK (status IN ('current', 'superseded', 'suspended', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX one_current_program_per_user_idx ON program(user_id) WHERE status = 'current';

CREATE TABLE program_version (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES program(id) ON DELETE RESTRICT,
  version integer NOT NULL CHECK (version > 0),
  origin text NOT NULL CHECK (origin IN ('initial_rules', 'adaptation_rule', 'human_review')),
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (program_id, version)
);

CREATE TABLE planned_session (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_user(id) ON DELETE RESTRICT,
  program_version_id uuid NOT NULL REFERENCES program_version(id) ON DELETE RESTRICT,
  planned_local_date date NOT NULL,
  timezone text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('strength', 'running', 'recovery', 'rest')),
  prescription jsonb NOT NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX planned_session_user_date_idx ON planned_session(user_id, planned_local_date);

CREATE TABLE session_run (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_user(id) ON DELETE RESTRICT,
  planned_session_id uuid NOT NULL REFERENCES planned_session(id) ON DELETE RESTRICT,
  status session_run_status NOT NULL DEFAULT 'in_progress',
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  summary jsonb,
  UNIQUE (planned_session_id, user_id)
);

CREATE TABLE session_event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_run_id uuid NOT NULL REFERENCES session_run(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES app_user(id) ON DELETE RESTRICT,
  client_event_id uuid NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('step_started', 'set_completed', 'paused', 'resumed', 'exercise_skipped', 'discomfort_reported')),
  payload jsonb NOT NULL DEFAULT '{}',
  occurred_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_run_id, client_event_id)
);

CREATE TABLE daily_checkin (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_user(id) ON DELETE RESTRICT,
  local_date date NOT NULL,
  timezone text NOT NULL,
  fatigue smallint NOT NULL CHECK (fatigue BETWEEN 0 AND 10),
  sleep_quality smallint NOT NULL CHECK (sleep_quality BETWEEN 0 AND 10),
  stress smallint NOT NULL CHECK (stress BETWEEN 0 AND 10),
  motivation smallint NOT NULL CHECK (motivation BETWEEN 0 AND 10),
  discomfort smallint CHECK (discomfort BETWEEN 0 AND 10),
  comment text CHECK (char_length(comment) <= 1000),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, local_date)
);

CREATE TABLE adaptation_decision (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_user(id) ON DELETE RESTRICT,
  rule_version_id uuid NOT NULL REFERENCES rule_version(id) ON DELETE RESTRICT,
  planned_session_id uuid REFERENCES planned_session(id) ON DELETE RESTRICT,
  action text NOT NULL CHECK (action IN ('maintain', 'reduce_volume', 'reduce_intensity', 'add_rest', 'suspend_progression', 'professional_review')),
  inputs jsonb NOT NULL,
  previous_value jsonb,
  new_value jsonb,
  reason_code text NOT NULL,
  explanation text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE idempotency_record (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_user(id) ON DELETE RESTRICT,
  operation text NOT NULL,
  key text NOT NULL CHECK (char_length(key) BETWEEN 8 AND 128),
  request_hash text NOT NULL,
  response_status integer,
  response_body jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  UNIQUE (user_id, operation, key)
);

CREATE TABLE outbox_message (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  payload jsonb NOT NULL,
  correlation_id text NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  available_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX outbox_ready_idx ON outbox_message(available_at) WHERE processed_at IS NULL AND failed_at IS NULL;

CREATE TABLE audit_event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES app_user(id) ON DELETE RESTRICT,
  actor_type text NOT NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  outcome text NOT NULL,
  reason_code text,
  request_id text,
  context jsonb NOT NULL DEFAULT '{}',
  occurred_at timestamptz NOT NULL DEFAULT now()
);
REVOKE UPDATE, DELETE ON audit_event FROM PUBLIC;
CREATE INDEX audit_resource_idx ON audit_event(resource_type, resource_id, occurred_at DESC);

COMMIT;
