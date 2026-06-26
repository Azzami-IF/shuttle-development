import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DriverStatusPage } from './driver-status.page';

const routes: Routes = [
  {
    path: '',
    component: DriverStatusPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DriverStatusPageRoutingModule {}
