import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TripTrackingPage } from './trip-tracking.page';

const routes: Routes = [
  {
    path: '',
    component: TripTrackingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TripTrackingPageRoutingModule {}
