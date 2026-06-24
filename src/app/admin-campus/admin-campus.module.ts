import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminCampusPageRoutingModule } from './admin-campus-routing.module';

import { AdminCampusPage } from './admin-campus.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminCampusPageRoutingModule
  ],
  declarations: [AdminCampusPage]
})
export class AdminCampusPageModule {}
