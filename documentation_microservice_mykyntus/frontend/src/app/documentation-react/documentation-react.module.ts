import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { DOCUMENTATION_REACT_ROUTES } from './documentation-react.routes';

@NgModule({
  imports: [RouterModule.forChild(DOCUMENTATION_REACT_ROUTES)],
})
export class DocumentationReactModule {}
