import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: false,
})
export class ResetPasswordPage implements OnInit {
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private ui = inject(UiService);
  private router = inject(Router);

  form = {
    token: '',
    email: '',
    password: '',
    password_confirmation: '',
  };
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  source: 'client' | 'driver' = 'client';

  constructor() {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    const email = this.route.snapshot.queryParamMap.get('email');
    this.form.token = token ?? '';
    this.form.email = email ?? '';
  }

  submit(event: Event) {
    event.preventDefault();

    if (!this.form.token || !this.form.email || !this.form.password || !this.form.password_confirmation) {
      void this.ui.showToast('Semua field wajib diisi', 'warning');
      return;
    }

    if (this.form.password.length < 8) {
      void this.ui.showToast('Password minimal 8 karakter', 'warning');
      return;
    }

    if (this.form.password !== this.form.password_confirmation) {
      void this.ui.showToast('Konfirmasi password tidak cocok', 'danger');
      return;
    }

    this.isLoading = true;
    this.auth.resetPassword(this.form).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        void this.ui.showToast(res?.message || 'Password berhasil direset', 'success');
        this.router.navigate(['/login'], { replaceUrl: true });
      },
      error: (err: any) => {
        this.isLoading = false;
        const msg = err?.error?.message || err?.error?.errors?.email?.[0] || err?.error?.errors?.token?.[0] || 'Gagal reset password';
        void this.ui.showToast(msg, 'danger');
      },
    });
  }

  goBack() {
    this.router.navigate(['/login']);
  }
}
