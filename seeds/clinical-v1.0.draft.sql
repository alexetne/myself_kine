-- DONNÉES SYNTHÉTIQUES DE PRÉPARATION UNIQUEMENT.
-- Ce fichier reste en brouillon et ne doit être exécuté qu'après remplacement
-- par le référentiel 1.0 formellement validé et signé.
BEGIN;

INSERT INTO consent_definition(code, version, title, purpose, required, locale, content_hash, published_at)
VALUES
  ('terms_of_service', 1, 'Conditions synthétiques', 'Fixture contractuelle synthétique', true, 'fr-FR', encode(digest('synthetic-terms-v1', 'sha256'), 'hex'), now()),
  ('sensitive_data_processing', 1, 'Traitement synthétique', 'Fixture de consentement synthétique', true, 'fr-FR', encode(digest('synthetic-sensitive-v1', 'sha256'), 'hex'), now())
ON CONFLICT (code, version) DO NOTHING;

INSERT INTO questionnaire_version(code, version, title, schema, status, content_hash)
VALUES (
  'qualification-v1', 1, 'Questionnaire synthétique de qualification',
  '{"data_classification":"synthetic","questions":[{"id":"synthetic_orientation","type":"single_choice","required":true,"options":["synthetic_clear","synthetic_caution","synthetic_professional_review","synthetic_urgent"]}]}'::jsonb,
  'draft', encode(digest('synthetic-questionnaire-v1', 'sha256'), 'hex')
)
ON CONFLICT (code, version) DO NOTHING;

WITH inserted_set AS (
  INSERT INTO rule_set(code, kind) VALUES ('qualification-v1', 'safety')
  ON CONFLICT (code) DO UPDATE SET code = EXCLUDED.code
  RETURNING id
)
INSERT INTO rule_set_version(rule_set_id, version, status, input_schema_version, rules, content_hash)
SELECT id, 1, 'draft', 'qualification-v1',
  '[
    {"code":"synthetic-urgent","priority":10,"when":{"fact":"synthetic_orientation","operator":"eq","value":"synthetic_urgent"},"level":"urgent","reason_code":"SYNTHETIC_URGENT","explanation":"Orientation synthétique urgente, sans diagnostic."},
    {"code":"synthetic-professional","priority":20,"when":{"fact":"synthetic_orientation","operator":"eq","value":"synthetic_professional_review"},"level":"professional_review","reason_code":"SYNTHETIC_PROFESSIONAL_REVIEW","explanation":"Orientation synthétique vers un professionnel, sans diagnostic."},
    {"code":"synthetic-caution","priority":30,"when":{"fact":"synthetic_orientation","operator":"eq","value":"synthetic_caution"},"level":"caution","reason_code":"SYNTHETIC_CAUTION","explanation":"Prudence synthétique, sans diagnostic."},
    {"code":"synthetic-clear","priority":40,"when":{"fact":"synthetic_orientation","operator":"eq","value":"synthetic_clear"},"level":"clear","reason_code":"SYNTHETIC_CLEAR","explanation":"Qualification synthétique compatible avec la poursuite du parcours."}
  ]'::jsonb,
  encode(digest('synthetic-rule-set-v1', 'sha256'), 'hex')
FROM inserted_set
ON CONFLICT (rule_set_id, version) DO NOTHING;

ROLLBACK;
