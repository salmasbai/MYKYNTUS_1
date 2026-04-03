import { Component, Input } from '@angular/core';

import { DocIconComponent } from '../doc-icon/doc-icon.component';

@Component({
  standalone: true,
  selector: 'app-admin-shell',
  imports: [DocIconComponent],
  templateUrl: './admin-shell.component.html',
})
export class AdminShellComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) description = '';
  @Input() iconName = 'settings';
}
