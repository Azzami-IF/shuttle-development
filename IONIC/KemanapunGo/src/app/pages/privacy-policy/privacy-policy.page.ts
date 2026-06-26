import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.page.html',
  styleUrls: ['./privacy-policy.page.scss'],
})
export class PrivacyPolicyPage implements OnInit {
  today = new Date();
  isChecked = false;

  constructor(private navCtrl: NavController) { }

  ngOnInit() {
  }

  agreeAndContinue() {
    this.navCtrl.back();
  }
}
