import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(private platform: Platform, private router: Router) {
    this.initializeBackButton();
  }

  private initializeBackButton() {
    this.platform.backButton.subscribeWithPriority(10, () => {
      const currentUrl = this.router.url;
      const rootTabs = ['/dashboard', '/schedule-list', '/booking-detail', '/profile', '/admin/dashboard'];
      
      if (currentUrl === '/login') {
        this.router.navigate(['/onboarding'], { replaceUrl: true });
        return;
      }
      if (currentUrl === '/onboarding') {
        return;
      }
      if (currentUrl === '/dashboard' || currentUrl === '/admin/dashboard') {
        // Exit app on Android if they are on the homepage
        (navigator as any)['app']?.exitApp();
        return;
      }
      if (rootTabs.includes(currentUrl)) {
        this.router.navigate(['/dashboard'], { replaceUrl: true });
        return;
      }

      window.history.back();
    });
  }
}
