import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminDidatticaPageRoutingModule } from './admin-didattica-routing.module';

import { AdminDidatticaPage } from './admin-didattica.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminDidatticaPageRoutingModule
  ],
  declarations: [AdminDidatticaPage]
})
export class AdminDidatticaPageModule {}
