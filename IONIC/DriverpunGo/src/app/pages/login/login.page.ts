import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';
import { LanguageService } from '../../services/language.service';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private ui = inject(UiService);
  langService = inject(LanguageService);
  loginData = {
    email: '',
    password: ''
  };
  showPassword = false;
  isLoading = false;
  privacyAccepted = false;

  constructor() {}

  getTranslation(key: string): string {
    return this.langService.get(key);
  }

  onLogin(event: Event) {
    event.preventDefault();
    if (!this.loginData.email || !this.loginData.password) {
      this.ui.showToast('Mohon isi email dan kata sandi', 'warning');
      return;
    }
    this.isLoading = true;
    this.auth.login(this.loginData).subscribe({
      next: (res) => {
        this.isLoading = false;

        // Role check: Only drivers can login through this page
        if (res.user.role !== 'driver') {
          this.ui.showAlert('Akses Ditolak', 'Akses hanya untuk driver.');
          this.auth.logoutDirect();
          return;
        }

        console.log('Driver login success', res);
        this.router.navigate(['/driver-dashboard'], { replaceUrl: true });
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Driver login failed', err);
        const msg = this.ui.getErrorMessage(err, 'Login gagal. Cek kembali akun Driver Anda.');
        this.ui.showAlert('Gagal', msg);
      }
    });
  }
}
