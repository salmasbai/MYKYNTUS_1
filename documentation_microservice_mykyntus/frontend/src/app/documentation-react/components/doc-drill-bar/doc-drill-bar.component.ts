import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import type { DocumentationRole } from '../../interfaces/documentation-role';
import { demoUserIdForRole, drillSelectOptions } from '../../lib/documentation-org-hierarchy';
import { DocumentationHierarchyDrillService } from '../../services/documentation-hierarchy-drill.service';

@Component({
  selector: 'app-doc-drill-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doc-drill-bar.component.html',
})
export class DocDrillBarComponent implements OnInit, OnDestroy {
  @Input({ required: true }) role!: DocumentationRole;

  drill = this.hierarchy.drill;
  managers: { value: string; label: string }[] = [];
  coaches: { value: string; label: string }[] = [];
  private sub = new Subscription();

  constructor(private readonly hierarchy: DocumentationHierarchyDrillService) {}

  ngOnInit(): void {
    this.sub.add(
      this.hierarchy.drill$.subscribe((d) => {
        this.drill = d;
        this.refreshOptions();
      }),
    );
    this.refreshOptions();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  get viewerId(): string {
    return demoUserIdForRole(this.role);
  }

  onManagerChange(value: string): void {
    this.hierarchy.setManagerId(value || undefined);
  }

  onCoachChange(value: string): void {
    this.hierarchy.setCoachId(value || undefined);
  }

  private refreshOptions(): void {
    const { managers, coaches } = drillSelectOptions(this.role, this.viewerId, this.drill);
    this.managers = managers;
    this.coaches = coaches;
  }
}
