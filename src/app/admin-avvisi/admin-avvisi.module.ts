import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminAvvisiPageRoutingModule } from './admin-avvisi-routing.module';

import { AdminAvvisiPage } from './admin-avvisi.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminAvvisiPageRoutingModule
  ],
  declarations: [AdminAvvisiPage]
})
export class AdminAvvisiPageModule {}
