import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { AdminSchedulesPage, ScheduleFormModalComponent } from './admin-schedules.page';

const routes: Routes = [
  {
    path: '',
    component: AdminSchedulesPage
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
  declarations: [AdminSchedulesPage, ScheduleFormModalComponent]
})
export class AdminSchedulesPageModule {}
