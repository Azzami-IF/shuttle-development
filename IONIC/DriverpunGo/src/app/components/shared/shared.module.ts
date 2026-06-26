import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { BottomNavComponent } from './bottom-nav/bottom-nav.component';

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule, BottomNavComponent],
  exports: [BottomNavComponent]
})
export class SharedModule {}
