import { Component, OnInit } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-driver-help',
  templateUrl: './driver-help.page.html',
  styleUrls: ['./driver-help.page.scss'],
})
export class DriverHelpPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  openWhatsApp() {
    window.open('https://wa.me/6281234567890?text=Halo%20Support%20DriverpunGo,%20saya%20butuh%20bantuan', '_blank');
  }

  openEmail() {
    window.open('mailto:supportdriverpungo@gmail.com?subject=Bantuan%20DriverpunGo', '_blank');
  }
}
