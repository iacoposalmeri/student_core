import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminCampusPage } from './admin-campus.page';

const routes: Routes = [
  {
    path: '',
    component: AdminCampusPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminCampusPageRoutingModule {}
