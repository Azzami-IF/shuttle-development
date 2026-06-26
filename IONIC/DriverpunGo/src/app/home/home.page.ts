import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  private auth = inject(AuthService);
  private router = inject(Router);

  constructor() {}

  ionViewWillEnter() {
    if (this.auth.isAuthenticated()) {
      this.router.navigate([this.auth.getHomeRoute()], { replaceUrl: true });
    }
  }

}
