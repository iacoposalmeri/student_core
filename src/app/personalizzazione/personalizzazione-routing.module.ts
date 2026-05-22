import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PersonalizzazionePage } from './personalizzazione.page';

const routes: Routes = [
  {
    path: '',
    component: PersonalizzazionePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PersonalizzazionePageRoutingModule {}
