import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DriverVehiclePageRoutingModule } from './driver-vehicle-routing.module';
import { DriverVehiclePage } from './driver-vehicle.page';
import { SharedModule } from '../../components/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DriverVehiclePageRoutingModule,
    SharedModule
  ],
  declarations: [DriverVehiclePage]
})
export class DriverVehiclePageModule {}
