import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminHelpDeskPageRoutingModule } from './admin-help-desk-routing.module';

import { AdminHelpDeskPage } from './admin-help-desk.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminHelpDeskPageRoutingModule
  ],
  declarations: [AdminHelpDeskPage]
})
export class AdminHelpDeskPageModule {}
