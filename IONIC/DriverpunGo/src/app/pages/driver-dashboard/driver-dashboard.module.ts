import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DriverDashboardPageRoutingModule } from './driver-dashboard-routing.module';
import { DriverDashboardPage } from './driver-dashboard.page';
import { SharedModule } from '../../components/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DriverDashboardPageRoutingModule,
    SharedModule
  ],
  declarations: [DriverDashboardPage]
})
export class DriverDashboardPageModule {}
