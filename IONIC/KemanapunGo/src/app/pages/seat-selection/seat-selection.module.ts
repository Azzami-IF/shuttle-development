import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SeatSelectionPageRoutingModule } from './seat-selection-routing.module';
import { SeatSelectionPage } from './seat-selection.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SeatSelectionPageRoutingModule
  ],
  declarations: [SeatSelectionPage]
})
export class SeatSelectionPageModule {}
