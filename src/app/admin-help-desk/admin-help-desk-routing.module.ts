import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminHelpDeskPage } from './admin-help-desk.page';

const routes: Routes = [
  {
    path: '',
    component: AdminHelpDeskPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminHelpDeskPageRoutingModule {}
