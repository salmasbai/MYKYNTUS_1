import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-admin-toggle',
  templateUrl: './admin-toggle.component.html',
})
export class AdminToggleComponent {
  @Input({ required: true }) checked = false;
  @Input() label?: string;
  @Input() disabled = false;
  @Input() titleAttr?: string;
  @Output() checkedChange = new EventEmitter<boolean>();

  onChange(v: boolean): void {
    if (this.disabled) return;
    this.checkedChange.emit(v);
  }
}
