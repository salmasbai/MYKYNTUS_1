-- =============================================================================
-- MyKyntus Documentation — Jeu de données réaliste (production-like)
-- Prérequis : scripts 001 → 008 exécutés au moins une fois.
-- Effet : colonnes optionnelles + vidage des tables métier + réinsertion cohérente.
-- =============================================================================

SET search_path TO documentation, public;

ALTER TABLE documentation.document_templates
  ADD COLUMN IF NOT EXISTS document_type_id UUID REFERENCES documentation.document_types (id) ON DELETE SET NULL;

ALTER TABLE documentation.document_requests
  ADD COLUMN IF NOT EXISTS organizational_unit_id UUID REFERENCES documentation.organisation_units (id) ON DELETE SET NULL;

TRUNCATE TABLE
  documentation.workflow_step_actions,
  documentation.workflow_steps,
  documentation.generated_documents,
  documentation.document_requests,
  documentation.document_template_variables,
  documentation.document_templates,
  documentation.permission_policies,
  documentation.document_types,
  documentation.audit_logs,
  documentation.directory_users,
  documentation.document_request_sequences,
  documentation.organisation_units,
  documentation.workflows,
  documentation.dms_general_configuration,
  documentation.dms_storage_configuration
RESTART IDENTITY CASCADE;

-- ---------------------------------------------------------------------------
-- Hiérarchie organisationnelle (tenant atlas-tech-demo)
-- ---------------------------------------------------------------------------
INSERT INTO documentation.organisation_units (id, tenant_id, parent_id, unit_type, code, name) VALUES
  ('f0000001-0001-4001-8001-000000000001', 'atlas-tech-demo', NULL, 'POLE', 'POLE-COMM', 'Pôle Commercial & Relation Client'),
  ('f0000001-0001-4001-8001-000000000002', 'atlas-tech-demo', 'f0000001-0001-4001-8001-000000000001', 'CELLULE', 'CELL-CASA', 'Cellule Grand Casablanca'),
  ('f0000001-0001-4001-8001-000000000003', 'atlas-tech-demo', 'f0000001-0001-4001-8001-000000000001', 'CELLULE', 'CELL-RABAT', 'Cellule Rabat & Rabat-Salé'),
  ('f0000001-0001-4001-8001-000000000004', 'atlas-tech-demo', 'f0000001-0001-4001-8001-000000000002', 'DEPARTEMENT', 'DEPT-VTE-CASA', 'Département Ventes Terrain — Casa'),
  ('f0000001-0001-4001-8001-000000000005', 'atlas-tech-demo', 'f0000001-0001-4001-8001-000000000003', 'DEPARTEMENT', 'DEPT-CONSEIL-RBT', 'Département Conseil & Projets — Rabat'),
  ('f0000001-0001-4001-8001-000000000006', 'atlas-tech-demo', NULL, 'POLE', 'POLE-SUPPORT', 'Pôle Support & Opérations'),
  ('f0000001-0001-4001-8001-000000000007', 'atlas-tech-demo', 'f0000001-0001-4001-8001-000000000006', 'DEPARTEMENT', 'DEPT-PROG', 'Département Programmes & Gouvernance')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Workflow
-- ---------------------------------------------------------------------------
INSERT INTO documentation.workflows (
  id, name, is_default, audit_enabled, audit_read_only, audit_logs, audit_history, audit_export,
  created_at, updated_at
) VALUES (
  'a0000001-0001-4001-8001-000000000001',
  'Validation documentaire — Atlas Tech',
  TRUE, TRUE, TRUE, TRUE, TRUE, TRUE,
  NOW(), NOW()
);

INSERT INTO documentation.workflow_steps (
  id, workflow_id, step_order, step_key, name, assigned_role, sla_hours, notification_key, created_at, updated_at
) VALUES
  ('b0000001-0001-4001-8001-000000000001', 'a0000001-0001-4001-8001-000000000001', 1,
   'validation_coach', 'Contrôle opérationnel — coach', 'coach'::documentation.app_role, 24, 'email'::documentation.workflow_notification_key, NOW(), NOW()),
  ('b0000001-0001-4001-8001-000000000002', 'a0000001-0001-4001-8001-000000000001', 2,
   'validation_manager', 'Validation managériale', 'manager'::documentation.app_role, 24, 'email'::documentation.workflow_notification_key, NOW(), NOW()),
  ('b0000001-0001-4001-8001-000000000003', 'a0000001-0001-4001-8001-000000000001', 3,
   'validation_rp', 'Cohérence projet', 'rp'::documentation.app_role, 24, 'email'::documentation.workflow_notification_key, NOW(), NOW()),
  ('b0000001-0001-4001-8001-000000000004', 'a0000001-0001-4001-8001-000000000001', 4,
   'validation_rh', 'Décision RH', 'rh'::documentation.app_role, 48, 'email'::documentation.workflow_notification_key, NOW(), NOW());

INSERT INTO documentation.workflow_step_actions (workflow_step_id, action) VALUES
  ('b0000001-0001-4001-8001-000000000001', 'validate'::documentation.workflow_action_key),
  ('b0000001-0001-4001-8001-000000000002', 'validate'::documentation.workflow_action_key),
  ('b0000001-0001-4001-8001-000000000003', 'validate'::documentation.workflow_action_key),
  ('b0000001-0001-4001-8001-000000000004', 'approve'::documentation.workflow_action_key),
  ('b0000001-0001-4001-8001-000000000004', 'reject'::documentation.workflow_action_key),
  ('b0000001-0001-4001-8001-000000000004', 'archive'::documentation.workflow_action_key);

-- ---------------------------------------------------------------------------
-- Types de documents (12+)
-- ---------------------------------------------------------------------------
INSERT INTO documentation.document_types (
  id, code, name, description, department_code, retention_days, workflow_id, is_mandatory, is_active, created_at, updated_at
) VALUES
  ('c0000001-0001-4001-8001-000000000001', 'ATT_TRAVAIL_MA', 'Attestation de travail', 'Usage bancaire / location.', 'COMMERCIAL', 730, 'a0000001-0001-4001-8001-000000000001', TRUE, TRUE, NOW(), NOW()),
  ('c0000001-0001-4001-8001-000000000002', 'ATT_SALAIRE_MA', 'Attestation de salaire', 'Prêt / consulat.', 'RH', 1825, 'a0000001-0001-4001-8001-000000000001', TRUE, TRUE, NOW(), NOW()),
  ('c0000001-0001-4001-8001-000000000003', 'CERT_STAGE_CNSS', 'Attestation de stage CNSS', 'Fin de stage.', 'RH', 1095, 'a0000001-0001-4001-8001-000000000001', FALSE, TRUE, NOW(), NOW()),
  ('c0000001-0001-4001-8001-000000000004', 'ORDRE_MISSION', 'Ordre de mission', 'Déplacement professionnel.', 'COMMERCIAL', 365, 'a0000001-0001-4001-8001-000000000001', FALSE, TRUE, NOW(), NOW()),
  ('c0000001-0001-4001-8001-000000000005', 'ATTEST_FORMATION', 'Attestation de formation', 'Sessions internes.', 'TECH', 365, 'a0000001-0001-4001-8001-000000000001', FALSE, TRUE, NOW(), NOW()),
  ('c0000001-0001-4001-8001-000000000006', 'CONGE_PAYE', 'Attestation congés payés', 'RH / planning.', 'RH', 730, 'a0000001-0001-4001-8001-000000000001', FALSE, TRUE, NOW(), NOW()),
  ('c0000001-0001-4001-8001-000000000007', 'RIB_ATTEST', 'Attestation RIB employeur', 'Virement salaire.', 'RH', 365, 'a0000001-0001-4001-8001-000000000001', FALSE, TRUE, NOW(), NOW()),
  ('c0000001-0001-4001-8001-000000000008', 'ATTEST_NON_POURSUTE', 'Certificat de non-poursuite', 'Sortie / contentieux.', 'JURIDIQUE', 1825, 'a0000001-0001-4001-8001-000000000001', FALSE, TRUE, NOW(), NOW()),
  ('c0000001-0001-4001-8001-000000000009', 'ATTEST_CNSS', 'Attestation affiliation CNSS', 'Déclaration employeur.', 'RH', 1095, 'a0000001-0001-4001-8001-000000000001', TRUE, TRUE, NOW(), NOW()),
  ('c0000001-0001-4001-8001-000000000010', 'FICHE_PAIE_DUPLICATA', 'Duplicata bulletin de paie', 'Archivage paie.', 'RH', 2555, 'a0000001-0001-4001-8001-000000000001', FALSE, TRUE, NOW(), NOW()),
  ('c0000001-0001-4001-8001-000000000011', 'ATTEST_HEURES', 'Attestation d’heures supplémentaires', 'Contrôle temps.', 'RH', 730, 'a0000001-0001-4001-8001-000000000001', FALSE, TRUE, NOW(), NOW()),
  ('c0000001-0001-4001-8001-000000000012', 'CERTIFICAT_RESIDENCE_PRO', 'Certificat de résidence professionnelle', 'Mobilité / expatriation.', 'RH', 365, 'a0000001-0001-4001-8001-000000000001', FALSE, TRUE, NOW(), NOW());

-- ---------------------------------------------------------------------------
-- Modèles liés aux types
-- ---------------------------------------------------------------------------
INSERT INTO documentation.document_templates (id, code, name, updated_at, document_type_id) VALUES
  ('d0000001-0001-4001-8001-000000000001', 'TMPL_ATT_TRAVAIL_V3', 'Modèle attestation de travail', NOW(), 'c0000001-0001-4001-8001-000000000001'),
  ('d0000001-0001-4001-8001-000000000002', 'TMPL_SALAIRE_BILINGUE', 'Modèle attestation salaire FR/EN', NOW(), 'c0000001-0001-4001-8001-000000000002'),
  ('d0000001-0001-4001-8001-000000000003', 'TMPL_MISSION_V1', 'Ordre de mission standard', NOW(), 'c0000001-0001-4001-8001-000000000004');

INSERT INTO documentation.document_template_variables (id, template_id, variable_name, sort_order) VALUES
  (gen_random_uuid(), 'd0000001-0001-4001-8001-000000000001', 'EmployeNomComplet', 1),
  (gen_random_uuid(), 'd0000001-0001-4001-8001-000000000001', 'DateEmbauche', 2),
  (gen_random_uuid(), 'd0000001-0001-4001-8001-000000000002', 'SalaireBrutMAD', 1),
  (gen_random_uuid(), 'd0000001-0001-4001-8001-000000000003', 'Destination', 1);

-- ---------------------------------------------------------------------------
-- Annuaire — 22+ collaborateurs (managers / RP avant coachs / pilotes)
-- ---------------------------------------------------------------------------
INSERT INTO documentation.directory_users (id, tenant_id, prenom, nom, email, role, manager_id, coach_id, rp_id, pole_id, cellule_id, departement_id) VALUES
  ('22222222-2222-4222-8222-222222222201', 'atlas-tech-demo', 'Karim', 'Tazi', 'karim.tazi@atlas-tech-demo.dev', 'manager', NULL, NULL, '66666666-6666-4666-8666-666666666601', 'f0000001-0001-4001-8001-000000000001', 'f0000001-0001-4001-8001-000000000002', 'f0000001-0001-4001-8001-000000000004'),
  ('88888888-8888-4888-8888-888888888801', 'atlas-tech-demo', 'Sophie', 'Amrani', 'sophie.amrani@atlas-tech-demo.dev', 'manager', NULL, NULL, '66666666-6666-4666-8666-666666666601', 'f0000001-0001-4001-8001-000000000001', 'f0000001-0001-4001-8001-000000000003', 'f0000001-0001-4001-8001-000000000005'),
  ('66666666-6666-4666-8666-666666666601', 'atlas-tech-demo', 'Houda', 'Mansouri', 'houda.mansouri@atlas-tech-demo.dev', 'rp', NULL, NULL, NULL, 'f0000001-0001-4001-8001-000000000001', 'f0000001-0001-4001-8001-000000000002', 'f0000001-0001-4001-8001-000000000004'),
  ('33333333-3333-4333-8333-333333333301', 'atlas-tech-demo', 'Fatima', 'Alaoui', 'fatima.alaoui@atlas-tech-demo.dev', 'rh', NULL, NULL, NULL, 'f0000001-0001-4001-8001-000000000001', 'f0000001-0001-4001-8001-000000000002', 'f0000001-0001-4001-8001-000000000004'),
  ('77777777-7777-4777-8777-777777777701', 'atlas-tech-demo', 'Youssef', 'El Alamy', 'youssef.elalamy@atlas-tech-demo.dev', 'admin', NULL, NULL, NULL, 'f0000001-0001-4001-8001-000000000001', 'f0000001-0001-4001-8001-000000000002', 'f0000001-0001-4001-8001-000000000004'),
  ('44444444-4444-4444-8444-444444444401', 'atlas-tech-demo', 'Nadia', 'Berrada', 'nadia.berrada@atlas-tech-demo.dev', 'audit', NULL, NULL, NULL, 'f0000001-0001-4001-8001-000000000001', 'f0000001-0001-4001-8001-000000000002', 'f0000001-0001-4001-8001-000000000004'),
  ('55555555-5555-4555-8555-555555555501', 'atlas-tech-demo', 'Mehdi', 'Sefrioui', 'mehdi.sefrioui@atlas-tech-demo.dev', 'coach', '22222222-2222-4222-8222-222222222201', NULL, NULL, 'f0000001-0001-4001-8001-000000000001', 'f0000001-0001-4001-8001-000000000002', 'f0000001-0001-4001-8001-000000000004'),
  ('55555555-5555-4555-8555-555555555502', 'atlas-tech-demo', 'Yassine', 'Bennani', 'yassine.bennani@atlas-tech-demo.dev', 'coach', '22222222-2222-4222-8222-222222222201', NULL, NULL, 'f0000001-0001-4001-8001-000000000001', 'f0000001-0001-4001-8001-000000000002', 'f0000001-0001-4001-8001-000000000004'),
  ('55555555-5555-4555-8555-555555555503', 'atlas-tech-demo', 'Laila', 'Cherkaoui', 'laila.cherkaoui@atlas-tech-demo.dev', 'coach', '88888888-8888-4888-8888-888888888801', NULL, NULL, 'f0000001-0001-4001-8001-000000000001', 'f0000001-0001-4001-8001-000000000003', 'f0000001-0001-4001-8001-000000000005'),
  ('11111111-1111-4111-8111-111111111101', 'atlas-tech-demo', 'Yasmine', 'El Amrani', 'yasmine.elamrani@atlas-tech-demo.dev', 'pilote', NULL, '55555555-5555-4555-8555-555555555501', '66666666-6666-4666-8666-666666666601', 'f0000001-0001-4001-8001-000000000001', 'f0000001-0001-4001-8001-000000000002', 'f0000001-0001-4001-8001-000000000004'),
  ('11111111-1111-4111-8111-111111111102', 'atlas-tech-demo', 'Omar', 'Benali', 'omar.benali@atlas-tech-demo.dev', 'pilote', NULL, '55555555-5555-4555-8555-555555555501', '66666666-6666-4666-8666-666666666601', 'f0000001-0001-4001-8001-000000000001', 'f0000001-0001-4001-8001-000000000002', 'f0000001-0001-4001-8001-000000000004'),
  ('11111111-1111-4111-8111-111111111103', 'atlas-tech-demo', 'Salma', 'Idrissi', 'salma.idrissi@atlas-tech-demo.dev', 'pilote', NULL, '55555555-5555-4555-8555-555555555501', '66666666-6666-4666-8666-666666666601', 'f0000001-0001-4001-8001-000000000001', 'f0000001-0001-4001-8001-000000000002', 'f0000001-0001-4001-8001-000000000004'),
  ('11111111-1111-4111-8111-111111111104', 'atlas-tech-demo', 'Ahmed', 'Ouazzani', 'ahmed.ouazzani@atlas-tech-demo.dev', 'pilote', NULL, '55555555-5555-4555-8555-555555555501', '66666666-6666-4666-8666-666666666601', 'f0000001-0001-4001-8001-000000000001', 'f0000001-0001-4001-8001-000000000002', 'f0000001-0001-4001-8001-000000000004'),
  ('11111111-1111-4111-8111-111111111105', 'atlas-tech-demo', 'Imane', 'Fassi', 'imane.fassi@atlas-tech-demo.dev', 'pilote', NULL, '55555555-5555-4555-8555-555555555502', '66666666-6666-4666-8666-666666666601', 'f0000001-0001-4001-8001-000000000001', 'f0000001-0001-4001-8001-000000000002', 'f0000001-0001-4001-8001-000000000004'),
  ('11111111-1111-4111-8111-111111111106', 'atlas-tech-demo', 'Karim', 'Lahlou', 'karim.lahlou@atlas-tech-demo.dev', 'pilote', NULL, '55555555-5555-4555-8555-555555555502', '66666666-6666-4666-8666-666666666601', 'f0000001-0001-4001-8001-000000000001', 'f0000001-0001-4001-8001-000000000002', 'f0000001-0001-4001-8001-000000000004'),
  ('11111111-1111-4111-8111-111111111107', 'atlas-tech-demo', 'Nadia', 'Tazi', 'nadia.tazi@atlas-tech-demo.dev', 'pilote', NULL, '55555555-5555-4555-8555-555555555503', '66666666-6666-4666-8666-666666666601', 'f0000001-0001-4001-8001-000000000001', 'f0000001-0001-4001-8001-000000000003', 'f0000001-0001-4001-8001-000000000005'),
  ('11111111-1111-4111-8111-111111111108', 'atlas-tech-demo', 'Hicham', 'Berrada', 'hicham.berrada@atlas-tech-demo.dev', 'pilote', NULL, '55555555-5555-4555-8555-555555555503', '66666666-6666-4666-8666-666666666601', 'f0000001-0001-4001-8001-000000000001', 'f0000001-0001-4001-8001-000000000003', 'f0000001-0001-4001-8001-000000000005'),
  ('11111111-1111-4111-8111-111111111109', 'atlas-tech-demo', 'Sara', 'Mouline', 'sara.mouline@atlas-tech-demo.dev', 'pilote', NULL, '55555555-5555-4555-8555-555555555503', '66666666-6666-4666-8666-666666666601', 'f0000001-0001-4001-8001-000000000001', 'f0000001-0001-4001-8001-000000000003', 'f0000001-0001-4001-8001-000000000005'),
  ('11111111-1111-4111-8111-111111111110', 'atlas-tech-demo', 'Younes', 'Alami', 'younes.alami@atlas-tech-demo.dev', 'pilote', NULL, '55555555-5555-4555-8555-555555555503', '66666666-6666-4666-8666-666666666601', 'f0000001-0001-4001-8001-000000000001', 'f0000001-0001-4001-8001-000000000003', 'f0000001-0001-4001-8001-000000000005'),
  ('11111111-1111-4111-8111-111111111111', 'atlas-tech-demo', 'Laila', 'Cherkaoui', 'laila.cherkaoui2@atlas-tech-demo.dev', 'pilote', NULL, '55555555-5555-4555-8555-555555555503', '66666666-6666-4666-8666-666666666601', 'f0000001-0001-4001-8001-000000000001', 'f0000001-0001-4001-8001-000000000003', 'f0000001-0001-4001-8001-000000000005'),
  ('11111111-1111-4111-8111-111111111112', 'atlas-tech-demo', 'Reda', 'Senhaji', 'reda.senhaji@atlas-tech-demo.dev', 'pilote', NULL, '55555555-5555-4555-8555-555555555501', '66666666-6666-4666-8666-666666666601', 'f0000001-0001-4001-8001-000000000001', 'f0000001-0001-4001-8001-000000000002', 'f0000001-0001-4001-8001-000000000004'),
  ('11111111-1111-4111-8111-111111111113', 'atlas-tech-demo', 'Fatine', 'Zahiri', 'fatine.zahiri@atlas-tech-demo.dev', 'pilote', NULL, '55555555-5555-4555-8555-555555555501', '66666666-6666-4666-8666-666666666601', 'f0000001-0001-4001-8001-000000000001', 'f0000001-0001-4001-8001-000000000002', 'f0000001-0001-4001-8001-000000000004'),
  ('11111111-1111-4111-8111-111111111114', 'atlas-tech-demo', 'Anas', 'Kettani', 'anas.kettani@atlas-tech-demo.dev', 'pilote', NULL, '55555555-5555-4555-8555-555555555501', '66666666-6666-4666-8666-666666666601', 'f0000001-0001-4001-8001-000000000001', 'f0000001-0001-4001-8001-000000000002', 'f0000001-0001-4001-8001-000000000004');

-- ---------------------------------------------------------------------------
-- Permissions (échantillon)
-- ---------------------------------------------------------------------------
INSERT INTO documentation.permission_policies (id, role, document_type_id, department_code, can_read, can_create, can_update, can_delete, can_validate, created_at, updated_at) VALUES
  (gen_random_uuid(), 'rh'::documentation.app_role, NULL, NULL, TRUE, TRUE, TRUE, FALSE, TRUE, NOW(), NOW()),
  (gen_random_uuid(), 'pilote'::documentation.app_role, NULL, NULL, TRUE, TRUE, FALSE, FALSE, FALSE, NOW(), NOW()),
  (gen_random_uuid(), 'admin'::documentation.app_role, NULL, NULL, TRUE, TRUE, TRUE, TRUE, TRUE, NOW(), NOW()),
  (gen_random_uuid(), 'audit'::documentation.app_role, NULL, NULL, TRUE, FALSE, FALSE, FALSE, FALSE, NOW(), NOW());

INSERT INTO documentation.dms_general_configuration (
  id, system_name, default_language, default_timezone, max_file_size_mb, allowed_file_types,
  versioning_enabled, retention_days_default, documents_mandatory_by_type, auto_numbering_enabled, numbering_pattern,
  encryption_enabled, external_sharing_enabled, electronic_signature_enabled,
  email_on_upload, email_on_validation, email_on_rejection, reminder_expired_enabled,
  created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Atlas Tech — GED',
  'fr', 'Africa/Casablanca', 30, 'pdf,doc,docx,png,jpg',
  TRUE, 365, TRUE, TRUE, 'ATLAS-DOC-{YEAR}-{SEQ}',
  TRUE, FALSE, TRUE,
  TRUE, TRUE, TRUE, TRUE,
  NOW(), NOW()
);

INSERT INTO documentation.dms_storage_configuration (
  id, storage_type, api_url, bucket_name, region, access_key_reference, backup_enabled, compression_enabled,
  created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'cloud'::documentation.storage_type,
  'https://s3.eu-west-1.amazonaws.com/atlas-tech-docs-ma',
  'atlas-tech-dms-prod-ma', 'eu-west-1', 'vault:secret/dms/aws', TRUE, TRUE,
  NOW(), NOW()
);

-- ---------------------------------------------------------------------------
-- Demandes : 4 par collaborateur (22 × 4 = 88) — chaque employé a des REQ dédiées
-- Séquence par employé : 1 pending, 1 approved, 2 generated (pour 2 fichiers GED chacun)
-- ---------------------------------------------------------------------------
WITH expanded AS (
  SELECT
    du.id AS requester_id,
    du.departement_id,
    n AS seq,
    ROW_NUMBER() OVER (ORDER BY du.id, n) AS global_seq
  FROM documentation.directory_users du
  CROSS JOIN generate_series(1, 4) AS n
  WHERE du.tenant_id = 'atlas-tech-demo'
),
typed AS (
  SELECT
    e.*,
    dt.id AS document_type_id
  FROM expanded e
  CROSS JOIN LATERAL (
    SELECT id
    FROM documentation.document_types
    ORDER BY code
    LIMIT 1 OFFSET ((e.global_seq + e.seq) % 12)
  ) AS dt
)
INSERT INTO documentation.document_requests (
  id, tenant_id, request_number, requester_user_id, beneficiary_user_id,
  document_type_id, is_custom_type, custom_type_description, reason, status,
  decided_by_user_id, decided_at, rejection_reason, created_at, updated_at, organizational_unit_id
)
SELECT
  gen_random_uuid(),
  'atlas-tech-demo',
  format('REQ-2026-%s', lpad(t.global_seq::text, 6, '0')),
  t.requester_id,
  CASE
    WHEN t.seq = 2 AND t.global_seq % 11 = 0 THEN '11111111-1111-4111-8111-111111111102'::uuid
    ELSE NULL
  END,
  t.document_type_id,
  FALSE,
  NULL,
  format('Demande #%s — collaborateur (lot %s).', t.global_seq, t.seq),
  CASE t.seq
    WHEN 1 THEN 'pending'::documentation.document_request_status
    WHEN 2 THEN 'approved'::documentation.document_request_status
    WHEN 3 THEN 'generated'::documentation.document_request_status
    WHEN 4 THEN 'generated'::documentation.document_request_status
  END,
  CASE
    WHEN t.seq = 1 THEN NULL
    ELSE '33333333-3333-4333-8333-333333333301'::uuid
  END,
  CASE
    WHEN t.seq = 1 THEN NULL
    ELSE NOW() - ((t.global_seq::text || ' days')::interval)
  END,
  NULL,
  NOW() - ((t.global_seq::text || ' days')::interval),
  NOW() - ((t.global_seq::text || ' hours')::interval),
  t.departement_id
FROM typed t;

-- Un document généré par demande au statut « generated » (2 par employé)
INSERT INTO documentation.generated_documents (
  id, document_request_id, owner_user_id, document_type_id,
  file_name, storage_uri, mime_type, file_size_bytes,
  status, version_number, checksum_sha256, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  dr.id,
  dr.requester_user_id,
  dr.document_type_id,
  replace(dr.request_number, '-', '_') || '_' || left(replace(dt.code, ' ', '_'), 24) || '.pdf',
  's3://atlas-tech-dms-prod-ma/documents/2026/seed/' || dr.id::text || '.pdf',
  'application/pdf',
  (120000 + (abs(hashtext(dr.id::text)) % 500000))::bigint,
  'generated'::documentation.generated_document_status,
  1,
  NULL,
  dr.updated_at,
  dr.updated_at
FROM documentation.document_requests dr
JOIN documentation.document_types dt ON dt.id = dr.document_type_id
WHERE dr.tenant_id = 'atlas-tech-demo'
  AND dr.status = 'generated'::documentation.document_request_status;

INSERT INTO documentation.document_request_sequences (tenant_id, year, last_value)
VALUES ('atlas-tech-demo', 2026, 88)
ON CONFLICT (tenant_id, year) DO UPDATE SET last_value = EXCLUDED.last_value;

INSERT INTO documentation.audit_logs (id, tenant_id, occurred_at, actor_user_id, action, entity_type, entity_id, success)
SELECT gen_random_uuid(), 'atlas-tech-demo', NOW() - (g || ' hours')::interval,
  '33333333-3333-4333-8333-333333333301'::uuid, 'REQUEST_VIEW', 'document_request', gen_random_uuid(), TRUE
FROM generate_series(1, 20) g;

SET search_path TO public;
