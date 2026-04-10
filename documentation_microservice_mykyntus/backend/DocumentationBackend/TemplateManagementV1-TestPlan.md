# Template Management V1 - Test Plan

## API Functional Tests

1. Create template via upload:
   - `POST /api/documentation/data/document-templates/upload`
   - Body with placeholders `{{nom}}`, `{{date_embauche}}`
   - Expected: template created, variables auto-detected with types.

2. Create template via rule generation:
   - `POST /api/documentation/data/document-templates/rule-generate`
   - Expected: normalized HR sections (`EN_TETE`, `CORPS`, `SIGNATURE`) and default placeholders.

3. Version lifecycle:
   - `POST /api/documentation/data/document-templates/{id}/versions` with `draft`
   - `POST /api/documentation/data/document-templates/{id}/versions` with `published`
   - Expected: version increments, current version updated on publish.

4. Activation/deactivation:
   - `PATCH /api/documentation/data/document-templates/{id}/status`
   - Expected: generation blocked when inactive.

5. Test run:
   - `POST /api/documentation/data/document-templates/{id}/test-run`
   - Expected: rendered content and list of missing required variables.

6. Generation:
   - `POST /api/documentation/data/document-templates/{id}/generate`
   - Expected: generated document persisted with `template_version_id`.

## Security and Validation Tests

1. Oversized payloads:
   - Upload content > 100000 chars.
   - Expected: HTTP 400.

2. Invalid template code:
   - Code with spaces/special chars.
   - Expected: HTTP 400.

3. Invalid variable names:
   - Variables containing symbols.
   - Expected: sanitized/ignored in persisted variable list.

4. Tenant isolation:
   - Query templates with different `X-Tenant-Id`.
   - Expected: no cross-tenant visibility.
