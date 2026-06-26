import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { UiService } from '../../services/ui.service';
import { AlertController } from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'app-driver-dashboard',
  templateUrl: './driver-dashboard.page.html',
  styleUrls: ['./driver-dashboard.page.scss'],
})
export class DriverDashboardPage {
  private auth = inject(AuthService);
  private api = inject(ApiService);
  private router = inject(Router);
  private ui = inject(UiService);
  private alertCtrl = inject(AlertController);

  user$ = this.auth.user$;
  upcomingTrips: any[] = [];
  featuredTrip: any = null;
  tripSummaryLoading = false;

  constructor() {}

  ionViewWillEnter() {
    this.loadTripSummary();
  }

  showPending() {
    this.ui.showFeaturePending();
  }

  async showHelpDesk() {
    const alert = await this.alertCtrl.create({
      header: 'Bantuan Help Desk 24/7',
      message: 'Jika Anda mengalami kendala operasional, masalah pada kendaraan, atau kondisi darurat di jalan, silakan hubungi tim Support kami:\n\n📞 +62 851-5896-7790\n✉️ supportdriverpungo@gmail.com\n\nTim kami siap membantu Anda 24 jam sehari.',
      buttons: [
        { text: 'Tutup', role: 'cancel' },
        {
          text: 'Chat WhatsApp',
          handler: () => {
            window.open('https://wa.me/6285158967790', '_system');
          }
        }
      ]
    });
    await alert.present();
  }

  async showManual() {
    await this.ui.showAlert(
      'SOP & Panduan Pengemudi',
      '1. Pastikan kendaraan dalam kondisi prima sebelum berangkat.\n2. Verifikasi tiket penumpang saat proses boarding.\n3. Tekan "Mulai Perjalanan" saat akan berangkat agar sistem GPS aktif.\n4. Patuhi rambu lalu lintas dan jaga kecepatan aman.\n5. Laporkan segera jika terjadi kendala (delay, kerusakan) via aplikasi atau Help Desk.'
    );
  }

  loadTripSummary() {
    this.tripSummaryLoading = true;
    this.api.get('trips').subscribe({
      next: (res: any[]) => {
        const trips = res || [];
        const scheduledTrips = trips
          .filter(t => t.status === 'scheduled')
          .sort((a, b) => new Date(a.schedule?.departure_time).getTime() - new Date(b.schedule?.departure_time).getTime());

        this.featuredTrip = scheduledTrips.length ? scheduledTrips[0] : null;
        this.upcomingTrips = scheduledTrips.slice(1, 4);
        this.tripSummaryLoading = false;
      },
      error: () => {
        this.featuredTrip = null;
        this.upcomingTrips = [];
        this.tripSummaryLoading = false;
      }
    });
  }

  refreshTripSummary() {
    this.loadTripSummary();
  }

  formatTime(value: string): string {
    if (!value) return '--:--';
    return new Date(value).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }

  getCountdownLabel(value: string): string {
    if (!value) return 'Jadwal tidak tersedia';

    const diffMs = new Date(value).getTime() - Date.now();
    if (diffMs <= 0) return 'Siap berangkat';

    const diffMin = Math.round(diffMs / 60000);
    if (diffMin < 60) return `${diffMin} menit lagi`;

    const hours = Math.floor(diffMin / 60);
    const minutes = diffMin % 60;
    return `${hours} jam ${minutes} menit lagi`;
  }

  async confirmLogout() {
    const confirmed = await this.ui.showConfirm('Logout', 'Anda akan keluar dari akun driver ini. Lanjutkan?');
    if (!confirmed) {
      return;
    }

    this.auth.logout().subscribe({
      next: () => {
        this.router.navigate(['/driver-login'], { replaceUrl: true });
      },
      error: (err) => {
        console.error('Logout failed', err);
        this.router.navigate(['/driver-login'], { replaceUrl: true });
      }
    });
  }
}
