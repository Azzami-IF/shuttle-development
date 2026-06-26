import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';
import { LanguageService } from '../../services/language.service';

@Component({
  standalone: false,
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private ui = inject(UiService);
  private languageService = inject(LanguageService);

  user$ = this.auth.user$;
  lang$ = this.languageService.lang$;
  homeRoute = '/dashboard';
  currentLanguageLabel = 'Indonesia';
  isEditingProfile = false;
  isChangingPassword = false;
  profileData = { name: '', phone: '' };
  passwordData = { old_password: '', new_password: '' };
  isLoading = false;

  constructor() {
    const savedLanguage = this.languageService.getCurrentLang();
    this.currentLanguageLabel = savedLanguage === 'en' ? 'English' : 'Indonesia';
  }

  ionViewWillEnter() {
    console.log('Profile will enter');
    this.homeRoute = this.auth.getHomeRoute();
  }

  async openLanguageSelection() {
    const options = [
      { label: 'Indonesia', value: 'id' },
      { label: 'English', value: 'en' }
    ];
    
    const currentVal = this.languageService.getCurrentLang();
    const selected = await this.ui.showRadioSelection('Pilih Bahasa', options, currentVal);
    
    if (selected) {
      this.languageService.setLanguage(selected);
      this.currentLanguageLabel = selected === 'en' ? 'English' : 'Indonesia';
      void this.ui.showToast(`Bahasa diganti ke ${this.currentLanguageLabel}`, 'success');
    }
  }

  getTranslation(key: string): string {
    return this.languageService.get(key);
  }

  showPending() {
    this.ui.showFeaturePending();
  }

  openEditProfile(user: any) {
    this.profileData.name = user.name || '';
    this.profileData.phone = user.phone || '';
    this.isEditingProfile = true;
  }

  saveProfile() {
    this.isLoading = true;
    this.auth.updateProfile(this.profileData).subscribe({
      next: () => {
        this.isLoading = false;
        this.isEditingProfile = false;
        void this.ui.showToast('Profil berhasil diperbarui!', 'success');
      },
      error: (err) => {
        this.isLoading = false;
        void this.ui.showAlert('Gagal memperbarui profil', this.ui.getErrorMessage(err, 'Error'));
      }
    });
  }

  openChangePassword() {
    this.passwordData.old_password = '';
    this.passwordData.new_password = '';
    this.isChangingPassword = true;
  }

  savePassword() {
    if (this.passwordData.new_password.length < 8) {
      void this.ui.showToast('Kata sandi baru minimal 8 karakter!', 'warning');
      return;
    }
    this.isLoading = true;
    this.auth.changePassword(this.passwordData).subscribe({
      next: () => {
        this.isLoading = false;
        this.isChangingPassword = false;
        void this.ui.showToast('Kata sandi berhasil diperbarui!', 'success');
      },
      error: (err) => {
        this.isLoading = false;
        void this.ui.showAlert('Gagal mengganti kata sandi', this.ui.getErrorMessage(err, 'Sandi lama salah'));
      }
    });
  }

  async confirmLogout() {
    const confirmed = await this.ui.showConfirm('Logout', 'Anda akan keluar dari sesi ini. Lanjutkan?');
    if (!confirmed) {
      return;
    }

    this.auth.logout().subscribe({
      next: () => {
        this.router.navigate(['/login'], { replaceUrl: true });
      },
      error: (err) => {
        console.error('Logout failed', err);
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    });
  }

}
