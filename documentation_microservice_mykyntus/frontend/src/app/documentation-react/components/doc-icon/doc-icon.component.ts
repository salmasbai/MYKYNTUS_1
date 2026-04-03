import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type DocIconName = string;

@Component({
  selector: 'app-doc-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doc-icon.component.html',
})
export class DocIconComponent {
  @Input({ required: true }) name!: DocIconName;
  @Input() klass = 'w-6 h-6';
}
