import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DriverHelpPage } from './driver-help.page';

const routes: Routes = [
  {
    path: '',
    component: DriverHelpPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DriverHelpPageRoutingModule {}
