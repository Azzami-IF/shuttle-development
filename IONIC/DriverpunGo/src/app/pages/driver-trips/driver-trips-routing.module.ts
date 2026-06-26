import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DriverTripsPage } from './driver-trips.page';

const routes: Routes = [
  {
    path: '',
    component: DriverTripsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DriverTripsPageRoutingModule {}
