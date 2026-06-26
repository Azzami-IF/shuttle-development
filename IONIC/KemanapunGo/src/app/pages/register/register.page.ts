import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';

@Component({
  standalone: false,
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private ui = inject(UiService);

  registerData = {
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer'
  };
  isLoading = false;
  showPassword = false;
  agreedToTerms = false;

  constructor() {}

  onRegister(event: Event) {
    event.preventDefault();
    this.isLoading = true;
    this.auth.register(this.registerData).subscribe({
      next: (res) => {
        this.isLoading = false;
        console.log('Registration success', res);
        this.router.navigate([this.auth.getHomeRoute()], { replaceUrl: true });
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Registration failed', err);
        const msg = err?.error?.message || err?.error?.errors?.email?.[0] || 'Pendaftaran gagal';
        void this.ui.showToast(msg, 'danger');
      }
    });
  }

  goBack() {
    window.history.back();
  }

  async showPrivacyPolicy() {
    await this.ui.showAlert(
      'Kebijakan Privasi',
      'Kami menjaga data pribadi Anda dengan aman. Informasi Anda hanya digunakan untuk keperluan layanan transportasi KemanapunGo. Kami tidak akan membagikan data Anda kepada pihak ketiga tanpa izin Anda.'
    );
  }
}
