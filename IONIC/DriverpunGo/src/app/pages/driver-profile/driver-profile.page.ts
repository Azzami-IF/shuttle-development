import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';
import { LanguageService } from '../../services/language.service';

@Component({
  standalone: false,
  selector: 'app-driver-profile',
  templateUrl: './driver-profile.page.html',
  styleUrls: ['./driver-profile.page.scss'],
})
export class DriverProfilePage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private ui = inject(UiService);
  public langService = inject(LanguageService);

  user$ = this.auth.user$;
  currentLanguage = localStorage.getItem('language') || 'id';

  getTranslation(key: string): string {
    return this.langService.get(key);
  }

  showPending() {
    this.ui.showFeaturePending();
  }

  async changeLanguage() {
    const selected = await this.ui.showRadioSelection('Pilih Bahasa / Select Language', [
      { label: 'Bahasa Indonesia', value: 'id' },
      { label: 'English', value: 'en' }
    ], this.currentLanguage);

    if (selected) {
      this.currentLanguage = selected;
      this.langService.setLanguage(selected);
      window.location.reload();
    }
  }

  async confirmLogout() {
    const confirmed = await this.ui.showConfirm('Logout', 'Anda akan keluar dari akun driver ini. Lanjutkan?');
    if (!confirmed) {
      return;
    }

    this.auth.logout().subscribe({
      next: () => {
        this.router.navigate(['/login'], { replaceUrl: true });
      },
      error: () => {
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    });
  }
}
