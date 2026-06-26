import { Component, inject } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  private platform = inject(Platform);
  private router = inject(Router);

  constructor() {
    this.initializeBackButton();
  }

  private initializeBackButton() {
    this.platform.backButton.subscribeWithPriority(10, () => {
      const currentUrl = this.router.url;
      if (currentUrl === '/login') {
        this.router.navigate(['/onboarding'], { replaceUrl: true });
        return;
      }
      if (currentUrl === '/onboarding') {
        return;
      }

      window.history.back();
    });
  }
}
