import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DriverHelpPageRoutingModule } from './driver-help-routing.module';

import { DriverHelpPage } from './driver-help.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DriverHelpPageRoutingModule
  ],
  declarations: [DriverHelpPage]
})
export class DriverHelpPageModule {}
