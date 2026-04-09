import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { DocumentationDataApiService } from '../../core/services/documentation-data-api.service';
import type { DocumentTemplateDetailDto, DocumentTemplateListItemDto, TemplateVariableDto } from '../../shared/models/api.models';
import { DocIconComponent } from '../components/doc-icon/doc-icon.component';

@Component({
  standalone: true,
  selector: 'app-templates-page',
  imports: [CommonModule, FormsModule, DocIconComponent],
  templateUrl: './templates-page.component.html',
})
export class TemplatesPageComponent implements OnInit, OnDestroy {
  readonly uploadPlaceholderHint = 'Contenu source avec placeholders {{nom}} ...';
  templates: DocumentTemplateListItemDto[] = [];
  selectedTemplate: DocumentTemplateDetailDto | null = null;
  loading = true;
  error: string | null = null;
  generatingId: string | null = null;
  selectedTemplateId: string | null = null;
  lastMessage: string | null = null;
  newTemplateMode: 'upload' | 'rule' = 'upload';
  form = {
    code: '',
    name: '',
    documentTypeId: '',
    fileName: '',
    content: '',
    description: '',
  };
  sampleDataRaw = '{\n  "nom": "El Fassi",\n  "prenom": "Salma",\n  "cin": "AB12345",\n  "poste": "Developpeuse",\n  "date_embauche": "2026-01-10",\n  "departement": "RH",\n  "date": "2026-04-09"\n}';
  testRunRendered: string | null = null;
  missingVariables: string[] = [];
  private sub = new Subscription();

  constructor(private readonly data: DocumentationDataApiService) {}

  ngOnInit(): void {
    this.reloadTemplates();
  }

  private reloadTemplates(): void {
    this.loading = true;
    this.sub.add(
      this.data.getDocumentTemplates().subscribe({
        next: (rows) => {
          this.templates = rows;
          this.loading = false;
          this.error = null;
        },
        error: () => {
          this.templates = [];
          this.loading = false;
          this.error = 'Impossible de charger les modèles (API /api/documentation/data/document-templates).';
        },
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  generate(t: DocumentTemplateListItemDto): void {
    this.generatingId = t.id;
    this.lastMessage = null;
    const sample = this.parseSampleData();
    this.sub.add(
      this.data.generateFromDocumentTemplate(t.id, { documentTypeId: t.documentTypeId, variables: sample ?? {} }).subscribe({
        next: (res) => {
          this.generatingId = null;
          this.lastMessage = `Généré : ${res.fileName} — ${res.storageUri}`;
          this.reloadTemplates();
        },
        error: () => {
          this.generatingId = null;
          this.lastMessage = 'Échec de la génération (vérifiez les en-têtes et la session).';
        },
      }),
    );
  }

  createTemplate(): void {
    this.lastMessage = null;
    if (!this.form.code || !this.form.name) {
      this.lastMessage = 'Code et nom sont obligatoires.';
      return;
    }

    const documentTypeId = this.form.documentTypeId.trim() || null;
    if (this.newTemplateMode === 'upload') {
      if (!this.form.content.trim()) {
        this.lastMessage = 'Le contenu upload est obligatoire.';
        return;
      }
      this.sub.add(
        this.data
          .createTemplateFromUpload({
            code: this.form.code,
            name: this.form.name,
            documentTypeId,
            fileName: this.form.fileName || 'upload.txt',
            content: this.form.content,
          })
          .subscribe({
            next: (res) => {
              this.lastMessage = `Template créé via upload: ${res.code}`;
              this.clearForm();
              this.reloadTemplates();
            },
            error: () => (this.lastMessage = 'Échec création template upload.'),
          }),
      );
      return;
    }

    if (!this.form.description.trim()) {
      this.lastMessage = 'La description RH est obligatoire.';
      return;
    }
    this.sub.add(
      this.data
        .createTemplateRuleBased({
          code: this.form.code,
          name: this.form.name,
          documentTypeId,
          description: this.form.description,
        })
        .subscribe({
          next: (res) => {
            this.lastMessage = `Template généré par règles: ${res.code}`;
            this.clearForm();
            this.reloadTemplates();
          },
          error: () => (this.lastMessage = 'Échec création template par règles.'),
        }),
    );
  }

  selectTemplate(templateId: string): void {
    this.selectedTemplateId = templateId;
    this.testRunRendered = null;
    this.missingVariables = [];
    this.sub.add(
      this.data.getDocumentTemplate(templateId).subscribe({
        next: (res) => (this.selectedTemplate = res),
        error: () => (this.lastMessage = 'Impossible de charger le détail du template.'),
      }),
    );
  }

  toggleTemplateStatus(template: DocumentTemplateListItemDto): void {
    this.sub.add(
      this.data.setTemplateStatus(template.id, !template.isActive).subscribe({
        next: () => {
          this.lastMessage = `Template ${template.code} ${template.isActive ? 'désactivé' : 'activé'}.`;
          this.reloadTemplates();
          if (this.selectedTemplateId === template.id) this.selectTemplate(template.id);
        },
        error: () => (this.lastMessage = 'Échec mise à jour du statut.'),
      }),
    );
  }

  publishNewVersion(): void {
    if (!this.selectedTemplate) return;
    const content = this.selectedTemplate.currentVersion?.structuredContent ?? '';
    const vars: TemplateVariableDto[] = this.selectedTemplate.currentVersion?.variables ?? [];
    this.sub.add(
      this.data
        .createTemplateVersion(this.selectedTemplate.id, {
          structuredContent: content,
          status: 'published',
          variables: vars.map((v) => ({
            name: v.name,
            type: v.type,
            isRequired: v.isRequired,
            defaultValue: v.defaultValue,
            validationRule: v.validationRule,
          })),
        })
        .subscribe({
          next: (res) => {
            this.lastMessage = `Version ${res.versionNumber} publiée.`;
            this.selectTemplate(this.selectedTemplate!.id);
            this.reloadTemplates();
          },
          error: () => (this.lastMessage = 'Échec publication version.'),
        }),
    );
  }

  runTest(): void {
    if (!this.selectedTemplate) return;
    const sample = this.parseSampleData();
    if (!sample) {
      this.lastMessage = 'JSON de données fictives invalide.';
      return;
    }
    this.sub.add(
      this.data.testRunTemplate(this.selectedTemplate.id, sample).subscribe({
        next: (res) => {
          this.testRunRendered = res.renderedContent;
          this.missingVariables = res.missingVariables;
        },
        error: () => (this.lastMessage = 'Échec test-run template.'),
      }),
    );
  }

  private parseSampleData(): Record<string, string> | null {
    try {
      const raw = JSON.parse(this.sampleDataRaw) as Record<string, unknown>;
      const normalized: Record<string, string> = {};
      Object.keys(raw).forEach((k) => {
        normalized[k] = String(raw[k] ?? '');
      });
      return normalized;
    } catch {
      return null;
    }
  }

  private clearForm(): void {
    this.form = { code: '', name: '', documentTypeId: '', fileName: '', content: '', description: '' };
  }
}
