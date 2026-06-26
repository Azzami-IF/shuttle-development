import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SeatSelectionPage } from './seat-selection.page';

const routes: Routes = [
  {
    path: '',
    component: SeatSelectionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SeatSelectionPageRoutingModule {}
