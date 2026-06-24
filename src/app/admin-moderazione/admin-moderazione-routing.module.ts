import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminModerazionePage } from './admin-moderazione.page';

const routes: Routes = [
  {
    path: '',
    component: AdminModerazionePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminModerazionePageRoutingModule {}
