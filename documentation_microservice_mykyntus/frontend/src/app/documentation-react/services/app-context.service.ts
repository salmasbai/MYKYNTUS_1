import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppTheme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class AppContextService {
  private readonly themeSubject = new BehaviorSubject<AppTheme>('dark');
  readonly theme$ = this.themeSubject.asObservable();

  private readonly messages: Record<string, string> = {
    'nav.dashboard': 'Tableau de bord',
    'nav.myDocs': 'Mes documents',
    'nav.requestDoc': 'Demander un document',
    'nav.requestTracking': 'Suivi des demandes',
    'nav.notifications': 'Notifications',
    'nav.settings': 'Paramètres',
    'nav.teamDocs': 'Documents de l’équipe',
    'nav.teamRequests': 'Demandes de l’équipe',
    'nav.allRequests': 'Toutes les demandes',
    'nav.docGen': 'Génération de documents',
    'nav.templates': 'Gestion des modèles',
    'nav.adminConfig': 'Configuration des documents',
    'nav.docTypes': 'Types de documents',
    'nav.permissions': 'Gestion des permissions',
    'nav.workflow': 'Configuration du flux',
    'nav.storage': 'Configuration du stockage',
    'nav.auditLogs': 'Journaux des documents',
    'nav.accessHistory': 'Historique d’accès',
    'nav.personal': 'Personnel',
    'nav.interface': 'Interface',
    'nav.switchRole': 'Changer de rôle (démo)',
    'nav.logout': 'Déconnexion',
    'header.search': 'Rechercher des documents…',
    'header.role': 'Développeur senior',
    'title.dashboard': 'Aperçu du tableau de bord',
    'title.myDocs': 'Mes documents',
    'title.request': 'Demander un document',
    'title.tracking': 'Suivi des demandes',
    'title.teamDocs': 'Documents de l’équipe',
    'title.teamRequests': 'Demandes de l’équipe',
    'title.hrMgmt': 'Toutes les demandes',
    'title.docGen': 'Génération de documents',
    'title.templates': 'Gestion des modèles',
    'title.adminConfig': 'Configuration générale',
    'title.docTypes': 'Types de documents',
    'title.permissions': 'Gestion des permissions',
    'title.workflow': 'Configuration du flux',
    'title.storage': 'Configuration du stockage',
    'title.auditLogs': 'Journaux des documents',
    'title.accessHistory': 'Historique d’accès',
  };

  constructor() {
    this.applyThemeToDocument(this.themeSubject.value);
  }

  t(key: string): string {
    return this.messages[key] ?? key;
  }

  get theme(): AppTheme {
    return this.themeSubject.value;
  }

  toggleTheme(): void {
    const next = this.themeSubject.value === 'dark' ? 'light' : 'dark';
    this.themeSubject.next(next);
    this.applyThemeToDocument(next);
  }

  /** Interface en français uniquement. */
  setLanguage(_: 'fr'): void {}

  private applyThemeToDocument(theme: AppTheme): void {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = 'fr';
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }
}
