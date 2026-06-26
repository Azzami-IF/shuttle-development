import { Component, inject } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { UiService } from '../../services/ui.service';

@Component({
  standalone: false,
  selector: 'app-driver-vehicle',
  templateUrl: './driver-vehicle.page.html',
  styleUrls: ['./driver-vehicle.page.scss'],
})
export class DriverVehiclePage {
  private api = inject(ApiService);
  private ui = inject(UiService);

  vehicle: any = {
    name: 'Kemanapun Express 01',
    license_plate: 'B 1234 ABC',
    capacity: 12,
    fuel: 88,
    maintenance: 'Ready',
    last_service: '2023-10-15'
  };

  constructor() {}

  ionViewWillEnter() {
    this.api.get('trips').subscribe({
      next: (res: any[]) => {
        const trips = res || [];
        // Cari perjalanan yang sedang berjalan atau yang akan datang
        const activeTrip = trips.find(t => t.status === 'on-going' || t.status === 'boarding') 
          || trips.filter(t => t.status === 'scheduled').sort((a, b) => new Date(a.schedule?.departure_time).getTime() - new Date(b.schedule?.departure_time).getTime())[0];

        if (activeTrip && activeTrip.schedule?.vehicle) {
          const v = activeTrip.schedule.vehicle;
          this.vehicle = {
            name: v.name,
            license_plate: v.license_plate,
            capacity: v.capacity,
            fuel: 92, // Mock data
            maintenance: 'Siap Beroperasi',
            last_service: '2026-05-10'
          };
        }
      },
      error: (err) => {
        console.error('Error fetching trips for vehicle', err);
      }
    });
  }

  private alertCtrl = inject(AlertController);

  async reportIssue() {
    const alert = await this.alertCtrl.create({
      header: 'Laporkan Kendala',
      subHeader: `${this.vehicle?.name || '-'} (${this.vehicle?.license_plate || '-'})`,
      message: 'Silakan deskripsikan masalah pada kendaraan ini:',
      inputs: [
        {
          name: 'issue',
          type: 'textarea',
          placeholder: 'Contoh: AC tidak dingin, ban kempes...',
        }
      ],
      buttons: [
        {
          text: 'Batal',
          role: 'cancel'
        },
        {
          text: 'Kirim Laporan',
          handler: (data) => {
            if (data.issue && data.issue.trim() !== '') {
              // Simulasi pengiriman data
              this.ui.showLoading('Mengirim laporan...').then(loading => {
                setTimeout(() => {
                  loading.dismiss();
                  this.ui.showToast('Laporan kendala berhasil dikirim ke Admin!', 'success');
                }, 1000);
              });
            } else {
              this.ui.showToast('Laporan tidak boleh kosong', 'warning');
              return false; // Prevent closing
            }
            return true;
          }
        }
      ]
    });

    await alert.present();
  }
}
