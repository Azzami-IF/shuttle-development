import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { DriverHistoryPage } from './driver-history.page';
import { SharedModule } from '../../components/shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: DriverHistoryPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [DriverHistoryPage]
})
export class DriverHistoryPageModule {}
