import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DriverVehiclePage } from './driver-vehicle.page';

const routes: Routes = [
  {
    path: '',
    component: DriverVehiclePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DriverVehiclePageRoutingModule {}
