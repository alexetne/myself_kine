BEGIN;

ALTER TABLE consent_definition
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS content_hash text,
  ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'fr-FR';

UPDATE consent_definition
SET title = COALESCE(title, code),
    content_hash = COALESCE(content_hash, encode(digest(code || ':' || version::text || ':' || purpose, 'sha256'), 'hex'));

ALTER TABLE consent_definition
  ALTER COLUMN title SET NOT NULL,
  ALTER COLUMN content_hash SET NOT NULL;

CREATE TABLE consent_withdrawal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_user(id) ON DELETE RESTRICT,
  consent_record_id uuid NOT NULL REFERENCES consent_record(id) ON DELETE RESTRICT,
  withdrawn_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (consent_record_id)
);
CREATE INDEX consent_withdrawal_user_time_idx ON consent_withdrawal(user_id, withdrawn_at DESC);

ALTER TABLE questionnaire_version
  ADD COLUMN IF NOT EXISTS content_hash text,
  ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'fr-FR',
  ADD COLUMN IF NOT EXISTS retired_at timestamptz;

UPDATE questionnaire_version
SET content_hash = COALESCE(content_hash, encode(digest(code || ':' || version::text || ':' || schema::text, 'sha256'), 'hex'));
ALTER TABLE questionnaire_version ALTER COLUMN content_hash SET NOT NULL;

CREATE TABLE rule_set (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  kind text NOT NULL CHECK (kind IN ('safety', 'adaptation')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE rule_set_version (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_set_id uuid NOT NULL REFERENCES rule_set(id) ON DELETE RESTRICT,
  version integer NOT NULL CHECK (version > 0),
  status content_status NOT NULL DEFAULT 'draft',
  input_schema_version text NOT NULL,
  rules jsonb NOT NULL CHECK (jsonb_typeof(rules) = 'array'),
  content_hash text NOT NULL,
  validated_by text,
  validated_at timestamptz,
  published_at timestamptz,
  disabled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (rule_set_id, version),
  CHECK (status <> 'published' OR (validated_by IS NOT NULL AND validated_at IS NOT NULL AND published_at IS NOT NULL))
);
CREATE UNIQUE INDEX one_published_rule_set_version_idx
  ON rule_set_version(rule_set_id) WHERE status = 'published';

ALTER TABLE safety_decision
  ADD COLUMN IF NOT EXISTS rule_set_version_id uuid REFERENCES rule_set_version(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS inputs jsonb,
  ADD COLUMN IF NOT EXISTS matched_rule_code text;
CREATE UNIQUE INDEX safety_decision_submission_idx ON safety_decision(submission_id);

COMMIT;
