import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  ionViewWillEnter() {
    if (this.auth.isAuthenticated()) {
      this.router.navigate([this.auth.getHomeRoute()], { replaceUrl: true });
    }
  }

}
