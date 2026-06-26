import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: false,
})
export class ForgotPasswordPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private ui = inject(UiService);
  private route = inject(ActivatedRoute);

  email = '';
  isLoading = false;
  constructor() {}

  submit(event: Event) {
    event.preventDefault();

    if (!this.email) {
      void this.ui.showToast('Mohon isi email terlebih dahulu', 'warning');
      return;
    }

    this.isLoading = true;
    this.auth.forgotPassword(this.email).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        void this.ui.showToast(res?.message || 'Link reset password telah dikirim ke email Anda.', 'success');
        this.router.navigate(['/reset-password'], {
          queryParams: {
            email: this.email
          }
        });
      },
      error: (err: any) => {
        this.isLoading = false;
        const msg = err?.error?.message || err?.error?.errors?.email?.[0] || 'Gagal mengirim link reset password';
        void this.ui.showToast(msg, 'danger');
      },
    });
  }

  goBack() {
    this.router.navigate(['/login']);
  }
}
