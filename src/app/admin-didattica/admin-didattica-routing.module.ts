import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminDidatticaPage } from './admin-didattica.page';

const routes: Routes = [
  {
    path: '',
    component: AdminDidatticaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminDidatticaPageRoutingModule {}
