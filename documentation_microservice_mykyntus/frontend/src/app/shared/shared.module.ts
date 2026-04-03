import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { WorkflowActionBarComponent } from './components/workflow-action-bar/workflow-action-bar.component';

@NgModule({
  declarations: [WorkflowActionBarComponent],
  imports: [CommonModule, RouterModule, FormsModule],
  exports: [CommonModule, RouterModule, FormsModule, WorkflowActionBarComponent],
})
export class SharedModule {}
