import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';
import { environment } from '../../../environments/environment';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  loginData = {
    email: '',
    password: ''
  };
  showPassword = false;
  isLoading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private ui: UiService
  ) {}

  onLogin(event: Event) {
    event.preventDefault();
    if (!this.loginData.email || !this.loginData.password) {
      void this.ui.showToast('Mohon isi email dan kata sandi', 'warning');
      return;
    }
    this.isLoading = true;
    this.auth.login(this.loginData).subscribe({
      next: (res) => {
        this.isLoading = false;

        // Role check: Driver must use driver portal
        if (res.user.role === 'driver') {
          void this.ui.showToast('Akses Ditolak: Gunakan portal Driver untuk akun pengemudi.', 'warning');
          this.auth.logoutDirect(); // Method to clear local storage without API call
          return;
        }

        // Admin can continue to admin dashboard from this portal
        if (res.user.role === 'admin') {
          this.router.navigate(['/admin/dashboard'], { replaceUrl: true });
          return;
        }

        console.log('Login success', res);
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Login failed', err);
        const msg = this.ui.getErrorMessage(err, 'Login gagal. Cek kembali akun Anda.');
        void this.ui.showToast(msg, 'danger');
      }
    });
  }

  goBack() {
    this.router.navigate(['/onboarding'], { replaceUrl: true });
  }

  continueAsGuest() {
    this.router.navigate(['/dashboard']);
  }

  async showPrivacyPolicy() {
    window.open('https://sites.google.com/mhs.ubpkarawang.ac.id/busapp/kebijakan-privasi', '_system');
  }
}
