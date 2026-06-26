import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DriverStatusPageRoutingModule } from './driver-status-routing.module';
import { DriverStatusPage } from './driver-status.page';
import { SharedModule } from '../../components/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DriverStatusPageRoutingModule,
    SharedModule
  ],
  declarations: [DriverStatusPage]
})
export class DriverStatusPageModule {}
