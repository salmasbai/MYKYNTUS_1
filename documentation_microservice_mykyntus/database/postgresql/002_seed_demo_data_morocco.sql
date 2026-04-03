-- =============================================================================
-- MyKyntus Documentation — Jeu de données de démonstration (Maroc, entreprise réaliste)
-- Base : mykyntus_documentation
--
-- À exécuter APRÈS 001_documentation_schema ; en production multi-tenant, enchaîner avec 003_multi_tenant.sql (ordre : 001 → 002 → 003).
-- pgAdmin : se connecter à mykyntus_documentation puis exécuter tout le script.
--
-- Contenu :
--   • UUID fixes = identités SSO / annuaire (Pilote, Coach/COASH, Manager, RP, RH, Admin, Audit)
--   • Workflow : coach (COASH) → manager → RP → RH
--   • Types de documents, modèles, permissions, config DMS / stockage
--   • Demandes : pending, approved, rejected, generated, cancelled + type « Autre »
--   • Documents générés, audit_logs, séquence REQ-2026-*
-- =============================================================================

SET search_path TO documentation, public;

-- ---------------------------------------------------------------------------
-- 0) Nettoyage (idempotence)
-- ---------------------------------------------------------------------------
TRUNCATE TABLE
  documentation.workflow_step_actions,
  documentation.workflow_steps,
  documentation.document_template_variables,
  documentation.generated_documents,
  documentation.document_requests,
  documentation.permission_policies,
  documentation.document_templates,
  documentation.document_types,
  documentation.workflows,
  documentation.audit_logs,
  documentation.dms_general_configuration,
  documentation.dms_storage_configuration,
  documentation.document_request_sequences
RESTART IDENTITY CASCADE;

-- ---------------------------------------------------------------------------
-- 1) Référence UUID — Atlas Tech Solutions SARL (Casa / Rabat)
--    Tous les rôles applicatifs : pilote, coach (COASH), manager, rp, rh, admin, audit
-- ---------------------------------------------------------------------------
-- 11111111-1111-4111-8111-111111111101  pilote   yasmine.elamrani@atlastech.ma — commerciale
-- 11111111-1111-4111-8111-111111111102  pilote   omar.benali@atlastech.ma — développeur
-- 11111111-1111-4111-8111-111111111103  pilote   salma.idrissi@atlastech.ma — RH junior
-- 11111111-1111-4111-8111-111111111104  pilote   ahmed.ouazzani@atlastech.ma — juridique
-- 55555555-5555-4555-8555-555555555501  coach    mehdi.sefrioui@atlastech.ma — COASH / coach terrain commercial Casa
-- 22222222-2222-4222-8222-222222222201  manager  karim.tazi@atlastech.ma — responsable commercial
-- 66666666-6666-4666-8666-666666666601  rp       houda.mansouri@atlastech.ma — responsable de programmes
-- 33333333-3333-4333-8333-333333333301  rh       fatima.alaoui@atlastech.ma — responsable RH
-- 77777777-7777-4777-8777-777777777701  admin    youssef.elalamy@atlastech.ma — administrateur SI / GED
-- 44444444-4444-4444-8444-444444444401  audit    nadia.berrada@atlastech.ma — audit interne

-- ---------------------------------------------------------------------------
-- 2) Workflow
-- ---------------------------------------------------------------------------
INSERT INTO documentation.workflows (
  id, name, is_default, audit_enabled, audit_read_only, audit_logs, audit_history, audit_export,
  created_at, updated_at
) VALUES (
  'a0000001-0001-4001-8001-000000000001'::uuid,
  'Validation documentaire standard — Atlas Tech',
  TRUE,
  TRUE, TRUE, TRUE, TRUE, TRUE,
  TIMESTAMPTZ '2025-06-01 09:00:00+01',
  TIMESTAMPTZ '2025-06-01 09:00:00+01'
);

INSERT INTO documentation.workflow_steps (
  id, workflow_id, step_order, step_key, name, assigned_role, sla_hours, notification_key, created_at, updated_at
) VALUES
  ('b0000001-0001-4001-8001-000000000001'::uuid, 'a0000001-0001-4001-8001-000000000001'::uuid, 1,
   'validation_coach', 'Contrôle opérationnel — coach terrain', 'coach'::documentation.app_role, 24, 'email'::documentation.workflow_notification_key,
   TIMESTAMPTZ '2025-06-01 09:00:00+01', TIMESTAMPTZ '2025-06-01 09:00:00+01'),
  ('b0000001-0001-4001-8001-000000000002'::uuid, 'a0000001-0001-4001-8001-000000000001'::uuid, 2,
   'validation_manager', 'Validation managériale — agence Casa', 'manager'::documentation.app_role, 24, 'email'::documentation.workflow_notification_key,
   TIMESTAMPTZ '2025-06-01 09:00:00+01', TIMESTAMPTZ '2025-06-01 09:00:00+01'),
  ('b0000001-0001-4001-8001-000000000003'::uuid, 'a0000001-0001-4001-8001-000000000001'::uuid, 3,
   'validation_rp', 'Cohérence projet / délégation', 'rp'::documentation.app_role, 24, 'email'::documentation.workflow_notification_key,
   TIMESTAMPTZ '2025-06-01 09:00:00+01', TIMESTAMPTZ '2025-06-01 09:00:00+01'),
  ('b0000001-0001-4001-8001-000000000004'::uuid, 'a0000001-0001-4001-8001-000000000001'::uuid, 4,
   'validation_rh', 'Décision finale RH — émission document', 'rh'::documentation.app_role, 48, 'email'::documentation.workflow_notification_key,
   TIMESTAMPTZ '2025-06-01 09:00:00+01', TIMESTAMPTZ '2025-06-01 09:00:00+01');

INSERT INTO documentation.workflow_step_actions (workflow_step_id, action) VALUES
  ('b0000001-0001-4001-8001-000000000001'::uuid, 'validate'::documentation.workflow_action_key),
  ('b0000001-0001-4001-8001-000000000002'::uuid, 'validate'::documentation.workflow_action_key),
  ('b0000001-0001-4001-8001-000000000003'::uuid, 'validate'::documentation.workflow_action_key),
  ('b0000001-0001-4001-8001-000000000004'::uuid, 'approve'::documentation.workflow_action_key),
  ('b0000001-0001-4001-8001-000000000004'::uuid, 'reject'::documentation.workflow_action_key),
  ('b0000001-0001-4001-8001-000000000004'::uuid, 'archive'::documentation.workflow_action_key);

-- ---------------------------------------------------------------------------
-- 3) Types de documents
-- ---------------------------------------------------------------------------
INSERT INTO documentation.document_types (
  id, code, name, description, department_code, retention_days, workflow_id, is_mandatory, is_active, created_at, updated_at
) VALUES
  ('c0000001-0001-4001-8001-000000000001'::uuid,
   'ATT_TRAVAIL_MA', 'Attestation de travail',
   'Attestation en français — banque, location, visa.', 'COMMERCIAL', 730,
   'a0000001-0001-4001-8001-000000000001'::uuid, TRUE, TRUE,
   TIMESTAMPTZ '2025-06-01 10:00:00+01', TIMESTAMPTZ '2025-06-01 10:00:00+01'),
  ('c0000001-0001-4001-8001-000000000002'::uuid,
   'ATT_SALAIRE_MA', 'Attestation de salaire',
   'Rémunération pour prêt immobilier ou dossier consulaire.', 'RH', 1825,
   'a0000001-0001-4001-8001-000000000001'::uuid, TRUE, TRUE,
   TIMESTAMPTZ '2025-06-01 10:00:00+01', TIMESTAMPTZ '2025-06-01 10:00:00+01'),
  ('c0000001-0001-4001-8001-000000000003'::uuid,
   'CERT_STAGE_CNSS', 'Attestation de stage (convention CNSS)',
   'Fin de stage — Damancom / employeur.', 'RH', 1095,
   'a0000001-0001-4001-8001-000000000001'::uuid, FALSE, TRUE,
   TIMESTAMPTZ '2025-06-01 10:00:00+01', TIMESTAMPTZ '2025-06-01 10:00:00+01'),
  ('c0000001-0001-4001-8001-000000000004'::uuid,
   'ORDRE_MISSION', 'Ordre de mission professionnelle',
   'Déplacement Casa — Tanger, client secteur public.', 'COMMERCIAL', 365,
   'a0000001-0001-4001-8001-000000000001'::uuid, FALSE, TRUE,
   TIMESTAMPTZ '2025-06-01 10:00:00+01', TIMESTAMPTZ '2025-06-01 10:00:00+01'),
  ('c0000001-0001-4001-8001-000000000005'::uuid,
   'ATTEST_FORMATION', 'Attestation de formation interne',
   'Sessions Agile & conformité — siège Rabat.', 'TECH', 365,
   'a0000001-0001-4001-8001-000000000001'::uuid, FALSE, TRUE,
   TIMESTAMPTZ '2025-06-01 10:00:00+01', TIMESTAMPTZ '2025-06-01 10:00:00+01');

-- ---------------------------------------------------------------------------
-- 4) Modèles + variables
-- ---------------------------------------------------------------------------
INSERT INTO documentation.document_templates (id, code, name, updated_at) VALUES
  ('d0000001-0001-4001-8001-000000000001'::uuid, 'TMPL_ATT_TRAVAIL_V3',
   'Modèle attestation de travail — juin 2025', TIMESTAMPTZ '2025-06-15 14:30:00+01'),
  ('d0000001-0001-4001-8001-000000000002'::uuid, 'TMPL_SALAIRE_BILINGUE',
   'Attestation salaire FR/EN', TIMESTAMPTZ '2025-07-01 11:00:00+01');

INSERT INTO documentation.document_template_variables (id, template_id, variable_name, sort_order) VALUES
  (gen_random_uuid(), 'd0000001-0001-4001-8001-000000000001'::uuid, 'EmployeNomComplet', 1),
  (gen_random_uuid(), 'd0000001-0001-4001-8001-000000000001'::uuid, 'EmployeCIN', 2),
  (gen_random_uuid(), 'd0000001-0001-4001-8001-000000000001'::uuid, 'DateEmbauche', 3),
  (gen_random_uuid(), 'd0000001-0001-4001-8001-000000000001'::uuid, 'PosteAr', 4),
  (gen_random_uuid(), 'd0000001-0001-4001-8001-000000000001'::uuid, 'SocieteRaisonSociale', 5),
  (gen_random_uuid(), 'd0000001-0001-4001-8001-000000000002'::uuid, 'EmployeNomComplet', 1),
  (gen_random_uuid(), 'd0000001-0001-4001-8001-000000000002'::uuid, 'SalaireBrutMAD', 2),
  (gen_random_uuid(), 'd0000001-0001-4001-8001-000000000002'::uuid, 'Periode', 3);

-- ---------------------------------------------------------------------------
-- 5) Configuration DMS + stockage
-- ---------------------------------------------------------------------------
INSERT INTO documentation.dms_general_configuration (
  id, system_name, default_language, default_timezone, max_file_size_mb, allowed_file_types,
  versioning_enabled, retention_days_default, documents_mandatory_by_type, auto_numbering_enabled, numbering_pattern,
  encryption_enabled, external_sharing_enabled, electronic_signature_enabled,
  email_on_upload, email_on_validation, email_on_rejection, reminder_expired_enabled,
  created_at, updated_at
) VALUES (
  'e0000001-0001-4001-8001-000000000001'::uuid,
  'Atlas Tech — GED RH',
  'fr',
  'Africa/Casablanca',
  30,
  'pdf,doc,docx,png,jpg',
  TRUE, 365, TRUE, TRUE, 'ATLAS-DOC-{YEAR}-{SEQ}',
  TRUE, FALSE, TRUE,
  TRUE, TRUE, TRUE, TRUE,
  TIMESTAMPTZ '2025-01-10 08:00:00+01',
  TIMESTAMPTZ '2026-02-01 09:00:00+01'
);

INSERT INTO documentation.dms_storage_configuration (
  id, storage_type, api_url, bucket_name, region, access_key_reference, backup_enabled, compression_enabled,
  created_at, updated_at
) VALUES (
  'e0000001-0001-4001-8001-000000000002'::uuid,
  'cloud'::documentation.storage_type,
  'https://s3.eu-west-1.amazonaws.com/atlas-tech-docs-ma',
  'atlas-tech-dms-prod-ma',
  'eu-west-1',
  'vault:secret/dms/aws-atlas/iam-readonly',
  TRUE, TRUE,
  TIMESTAMPTZ '2025-01-10 08:00:00+01',
  TIMESTAMPTZ '2026-02-01 09:00:00+01'
);

-- ---------------------------------------------------------------------------
-- 6) Permissions
-- ---------------------------------------------------------------------------
INSERT INTO documentation.permission_policies (
  id, role, document_type_id, department_code, can_read, can_create, can_update, can_delete, can_validate,
  created_at, updated_at
) VALUES
  (gen_random_uuid(), 'rh'::documentation.app_role, NULL, NULL, TRUE, TRUE, TRUE, FALSE, TRUE, NOW(), NOW()),
  -- COASH / Coach : même périmètre terrain que le mock app — validation opérationnelle, pas approve/reject final
  (gen_random_uuid(), 'coach'::documentation.app_role, 'c0000001-0001-4001-8001-000000000001'::uuid, 'COMMERCIAL',
   TRUE, TRUE, TRUE, FALSE, TRUE, NOW(), NOW()),
  (gen_random_uuid(), 'manager'::documentation.app_role, 'c0000001-0001-4001-8001-000000000004'::uuid, 'COMMERCIAL',
   TRUE, TRUE, TRUE, FALSE, TRUE, NOW(), NOW()),
  (gen_random_uuid(), 'rp'::documentation.app_role, 'c0000001-0001-4001-8001-000000000004'::uuid, NULL,
   TRUE, TRUE, TRUE, FALSE, TRUE, NOW(), NOW()),
  (gen_random_uuid(), 'admin'::documentation.app_role, NULL, NULL, TRUE, TRUE, TRUE, TRUE, TRUE, NOW(), NOW()),
  (gen_random_uuid(), 'audit'::documentation.app_role, NULL, NULL, TRUE, FALSE, FALSE, FALSE, FALSE, NOW(), NOW()),
  (gen_random_uuid(), 'pilote'::documentation.app_role, NULL, NULL, TRUE, TRUE, FALSE, FALSE, FALSE, NOW(), NOW());

-- ---------------------------------------------------------------------------
-- 7) Demandes (CHECK : catalogue OU autre + description)
-- ---------------------------------------------------------------------------
INSERT INTO documentation.document_requests (
  id, request_number, requester_user_id, beneficiary_user_id,
  document_type_id, is_custom_type, custom_type_description,
  reason, complementary_comments, status,
  decided_by_user_id, decided_at, rejection_reason,
  created_at, updated_at
) VALUES
  ('f0000001-0001-4001-8001-000000000001'::uuid, 'REQ-2026-000001',
   '11111111-1111-4111-8111-111111111101'::uuid, NULL,
   'c0000001-0001-4001-8001-000000000001'::uuid, FALSE, NULL,
   'Dossier prêt immobilier — Banque Populaire, agence Maârif.',
   'Urgent : RDV conseiller le 18/03/2026.', 'approved'::documentation.document_request_status,
   '33333333-3333-4333-8333-333333333301'::uuid, TIMESTAMPTZ '2026-03-12 15:20:00+01', NULL,
   TIMESTAMPTZ '2026-03-10 10:15:00+01', TIMESTAMPTZ '2026-03-12 15:20:00+01'),
  ('f0000001-0001-4001-8001-000000000002'::uuid, 'REQ-2026-000002',
   '11111111-1111-4111-8111-111111111102'::uuid, NULL,
   'c0000001-0001-4001-8001-000000000002'::uuid, FALSE, NULL,
   'Location longue durée — Rabat Agdal.',
   NULL, 'pending'::documentation.document_request_status,
   NULL, NULL, NULL,
   TIMESTAMPTZ '2026-03-20 09:30:00+01', TIMESTAMPTZ '2026-03-20 09:30:00+01'),
  ('f0000001-0001-4001-8001-000000000003'::uuid, 'REQ-2026-000003',
   '11111111-1111-4111-8111-111111111103'::uuid, NULL,
   'c0000001-0001-4001-8001-000000000003'::uuid, FALSE, NULL,
   'Renouvellement carte séjour — préfecture de Témara.',
   NULL, 'rejected'::documentation.document_request_status,
   '33333333-3333-4333-8333-333333333301'::uuid, TIMESTAMPTZ '2026-03-05 11:00:00+01',
   'Pièce manquante : CIN employeur tamponnée et récépissé CNSS à jour.',
   TIMESTAMPTZ '2026-03-01 16:45:00+01', TIMESTAMPTZ '2026-03-05 11:00:00+01'),
  ('f0000001-0001-4001-8001-000000000004'::uuid, 'REQ-2026-000004',
   '11111111-1111-4111-8111-111111111101'::uuid, NULL,
   'c0000001-0001-4001-8001-000000000005'::uuid, FALSE, NULL,
   'Formation interne Agile — ANAPEC.',
   NULL, 'generated'::documentation.document_request_status,
   '33333333-3333-4333-8333-333333333301'::uuid, TIMESTAMPTZ '2026-02-28 09:00:00+01', NULL,
   TIMESTAMPTZ '2026-02-20 14:00:00+01', TIMESTAMPTZ '2026-02-28 09:05:00+01'),
  ('f0000001-0001-4001-8001-000000000005'::uuid, 'REQ-2026-000005',
   '11111111-1111-4111-8111-111111111104'::uuid, NULL,
   NULL, TRUE,
   'Attestation de présence — tribunal de commerce Casablanca, audience reportée au 12/04/2026.',
   'Demande du cabinet Me. Benjelloun.',
   'Copie sous 48 h.', 'pending'::documentation.document_request_status,
   NULL, NULL, NULL,
   TIMESTAMPTZ '2026-03-22 08:00:00+01', TIMESTAMPTZ '2026-03-22 08:00:00+01'),
  ('f0000001-0001-4001-8001-000000000006'::uuid, 'REQ-2026-000006',
   '11111111-1111-4111-8111-111111111102'::uuid, NULL,
   'c0000001-0001-4001-8001-000000000004'::uuid, FALSE, NULL,
   'Mission annulée — client a reporté le POC.',
   NULL, 'cancelled'::documentation.document_request_status,
   NULL, NULL, NULL,
   TIMESTAMPTZ '2026-03-15 11:00:00+01', TIMESTAMPTZ '2026-03-16 09:00:00+01'),
  ('f0000001-0001-4001-8001-000000000007'::uuid, NULL,
   '22222222-2222-4222-8222-222222222201'::uuid, '11111111-1111-4111-8111-111111111101'::uuid,
   'c0000001-0001-4001-8001-000000000001'::uuid, FALSE, NULL,
   'Mobilité interne vers siège Rabat — pour Yasmine El Amrani.',
   'Priorité basse.', 'pending'::documentation.document_request_status,
   NULL, NULL, NULL,
   TIMESTAMPTZ '2026-03-23 17:00:00+01', TIMESTAMPTZ '2026-03-23 17:00:00+01');

-- ---------------------------------------------------------------------------
-- 8) Documents générés
-- ---------------------------------------------------------------------------
INSERT INTO documentation.generated_documents (
  id, document_request_id, owner_user_id, document_type_id, file_name, storage_uri, mime_type, file_size_bytes,
  status, version_number, checksum_sha256, created_at, updated_at
) VALUES
  (
    '10000001-0001-4001-8001-000000000001'::uuid,
    'f0000001-0001-4001-8001-000000000001'::uuid,
    '11111111-1111-4111-8111-111111111101'::uuid,
    'c0000001-0001-4001-8001-000000000001'::uuid,
    'ATTEST_TRAVAIL_ElAmrani_Yasmine_20260312.pdf',
    's3://atlas-tech-dms-prod-ma/documents/2026/03/ATTEST_TRAVAIL_ElAmrani_Yasmine_20260312.pdf',
    'application/pdf', 245892,
    'generated'::documentation.generated_document_status, 1,
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    TIMESTAMPTZ '2026-03-12 16:05:00+01', TIMESTAMPTZ '2026-03-12 16:05:00+01'
  ),
  (
    '10000001-0001-4001-8001-000000000002'::uuid,
    'f0000001-0001-4001-8001-000000000004'::uuid,
    '11111111-1111-4111-8111-111111111101'::uuid,
    'c0000001-0001-4001-8001-000000000005'::uuid,
    'ATTEST_FORMATION_Agile_20260228_ElAmrani.pdf',
    's3://atlas-tech-dms-prod-ma/documents/2026/02/ATTEST_FORMATION_Agile_20260228_ElAmrani.pdf',
    'application/pdf', 198440,
    'generated'::documentation.generated_document_status, 1, NULL,
    TIMESTAMPTZ '2026-02-28 09:30:00+01', TIMESTAMPTZ '2026-02-28 09:30:00+01'
  ),
  (
    '10000001-0001-4001-8001-000000000003'::uuid,
    NULL,
    '11111111-1111-4111-8111-111111111102'::uuid,
    'c0000001-0001-4001-8001-000000000002'::uuid,
    'Attestation_salaire_Benali_Omar_2025Q4.pdf',
    's3://atlas-tech-dms-prod-ma/archives/2025/paie/Attestation_salaire_Benali_Omar_2025Q4.pdf',
    'application/pdf', 312056,
    'archived'::documentation.generated_document_status, 1, NULL,
    TIMESTAMPTZ '2025-12-15 10:00:00+01', TIMESTAMPTZ '2025-12-15 10:00:00+01'
  );

-- ---------------------------------------------------------------------------
-- 9) Audit (export, décisions RH, tentative connexion suspecte)
-- ---------------------------------------------------------------------------
INSERT INTO documentation.audit_logs (
  id, occurred_at, actor_user_id, action, entity_type, entity_id, correlation_id, ip_address, user_agent, details, success, error_message
) VALUES
  (
    gen_random_uuid(), TIMESTAMPTZ '2026-03-10 14:05:00+01',
    '55555555-5555-4555-8555-555555555501'::uuid,
    'WORKFLOW_STEP_VALIDATED', 'document_request', 'f0000001-0001-4001-8001-000000000001'::uuid,
    gen_random_uuid(), '41.142.255.88'::inet, 'MyKyntus-Coach/2.1',
    '{"etape":"validation_coach","role":"coach","alias_metier":"COASH"}'::jsonb, TRUE, NULL
  ),
  (
    gen_random_uuid(), TIMESTAMPTZ '2026-03-10 16:30:00+01',
    '22222222-2222-4222-8222-222222222201'::uuid,
    'WORKFLOW_STEP_VALIDATED', 'document_request', 'f0000001-0001-4001-8001-000000000001'::uuid,
    NULL, '41.251.86.12'::inet, 'Mozilla/5.0 Edge/125.0',
    '{"etape":"validation_manager"}'::jsonb, TRUE, NULL
  ),
  (
    gen_random_uuid(), TIMESTAMPTZ '2026-03-11 10:15:00+01',
    '66666666-6666-4666-8666-666666666601'::uuid,
    'WORKFLOW_STEP_VALIDATED', 'document_request', 'f0000001-0001-4001-8001-000000000001'::uuid,
    NULL, '102.50.245.10'::inet, 'MyKyntus-RP/2.1',
    '{"etape":"validation_rp","projet":"OPCO Maroc NUM"}'::jsonb, TRUE, NULL
  ),
  (
    gen_random_uuid(), TIMESTAMPTZ '2026-03-12 15:20:00+01',
    '33333333-3333-4333-8333-333333333301'::uuid,
    'REQUEST_APPROVED', 'document_request', 'f0000001-0001-4001-8001-000000000001'::uuid,
    gen_random_uuid(), '41.251.86.12'::inet, 'Mozilla/5.0 Edge/125.0',
    '{"channel":"RH_portail","ville":"Casablanca"}'::jsonb, TRUE, NULL
  ),
  (
    gen_random_uuid(), TIMESTAMPTZ '2026-03-01 18:00:00+01',
    '77777777-7777-4777-8777-777777777701'::uuid,
    'CONFIG_GENERAL_VIEW', 'dms_general_configuration', 'e0000001-0001-4001-8001-000000000001'::uuid,
    NULL, '197.230.12.44'::inet, 'DocumentationBackend/1.0',
    '{"action":"lecture_config_singleton"}'::jsonb, TRUE, NULL
  ),
  (
    gen_random_uuid(), TIMESTAMPTZ '2026-03-12 16:05:10+01',
    '33333333-3333-4333-8333-333333333301'::uuid,
    'DOCUMENT_GENERATED', 'generated_document', '10000001-0001-4001-8001-000000000001'::uuid,
    NULL, '41.251.86.12'::inet, 'DocumentationBackend/1.0',
    '{"template":"TMPL_ATT_TRAVAIL_V3"}'::jsonb, TRUE, NULL
  ),
  (
    gen_random_uuid(), TIMESTAMPTZ '2026-03-05 11:00:00+01',
    '33333333-3333-4333-8333-333333333301'::uuid,
    'REQUEST_REJECTED', 'document_request', 'f0000001-0001-4001-8001-000000000003'::uuid,
    NULL, '105.66.12.99'::inet, 'Mozilla/5.0 Chrome/124.0',
    '{"pieces_manquantes":["cin_employeur","recipisse_cnss"]}'::jsonb, TRUE, NULL
  ),
  (
    gen_random_uuid(), TIMESTAMPTZ '2026-03-21 09:15:00+01',
    '44444444-4444-4444-8444-444444444401'::uuid,
    'EXPORT_AUDIT_CSV', 'audit_pack', NULL, gen_random_uuid(),
    '196.117.45.8'::inet, 'curl/8.5',
    '{"periode_debut":"2026-01-01","periode_fin":"2026-03-21","lignes":1247}'::jsonb, TRUE, NULL
  ),
  (
    gen_random_uuid(), TIMESTAMPTZ '2026-03-22 08:05:00+01',
    '11111111-1111-4111-8111-111111111104'::uuid,
    'REQUEST_CREATED', 'document_request', 'f0000001-0001-4001-8001-000000000005'::uuid,
    NULL, '160.176.0.22'::inet, 'MyKyntus-Web/17.2',
    '{"origine":"formulaire_pilote","type":"AUTRE"}'::jsonb, TRUE, NULL
  ),
  (
    gen_random_uuid(), TIMESTAMPTZ '2026-03-21 02:33:00+01',
    NULL, 'LOGIN_FAILED', 'authentication', NULL, NULL,
    '185.220.101.44'::inet, NULL,
    '{"tentatives":3}'::jsonb, FALSE,
    'Mot de passe incorrect — compte verrouillé 15 min.'
  );

-- ---------------------------------------------------------------------------
-- 10) Séquence REQ (6 numéros attribués ; la 7e sans numéro pour test backend)
-- ---------------------------------------------------------------------------
INSERT INTO documentation.document_request_sequences (year, last_value) VALUES (2026, 6);

SET search_path TO public;
