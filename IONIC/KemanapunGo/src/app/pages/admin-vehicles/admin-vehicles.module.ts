import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { AdminVehiclesPage, VehicleFormModalComponent } from './admin-vehicles.page';

const routes: Routes = [
  {
    path: '',
    component: AdminVehiclesPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AdminVehiclesPage, VehicleFormModalComponent]
})
export class AdminVehiclesPageModule {}
