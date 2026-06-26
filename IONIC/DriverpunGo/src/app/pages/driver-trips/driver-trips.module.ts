import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DriverTripsPageRoutingModule } from './driver-trips-routing.module';
import { DriverTripsPage } from './driver-trips.page';
import { SharedModule } from '../../components/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DriverTripsPageRoutingModule,
    SharedModule
  ],
  declarations: [DriverTripsPage]
})
export class DriverTripsPageModule {}
