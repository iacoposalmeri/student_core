import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PersonalizzazionePageRoutingModule } from './personalizzazione-routing.module';

import { PersonalizzazionePage } from './personalizzazione.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PersonalizzazionePageRoutingModule
  ],
  declarations: [PersonalizzazionePage]
})
export class PersonalizzazionePageModule {}
