import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminModerazionePageRoutingModule } from './admin-moderazione-routing.module';

import { AdminModerazionePage } from './admin-moderazione.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminModerazionePageRoutingModule
  ],
  declarations: [AdminModerazionePage]
})
export class AdminModerazionePageModule {}
