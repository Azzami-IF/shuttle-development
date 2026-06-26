import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TripTrackingPageRoutingModule } from './trip-tracking-routing.module';
import { TripTrackingPage } from './trip-tracking.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TripTrackingPageRoutingModule
  ],
  declarations: [TripTrackingPage]
})
export class TripTrackingPageModule {}
