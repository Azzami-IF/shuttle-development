import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';

@Component({
  standalone: false,
  selector: 'app-driver-trips',
  templateUrl: './driver-trips.page.html',
  styleUrls: ['./driver-trips.page.scss'],
})
export class DriverTripsPage {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);
  public langService = inject(LanguageService);

  getTranslation(key: string): string {
    return this.langService.get(key);
  }

  user$ = this.auth.user$;
  trips: any[] = [];
  nextTrip: any = null;
  laterTrips: any[] = [];
  filteredLaterTrips: any[] = [];
  activeTrip: any = null;
  today = new Date();
  searchTerm: string = '';

  constructor() {}

  ionViewWillEnter() {
    this.loadTrips();
  }

  loadTrips() {
    this.api.get('trips').subscribe((res: any[]) => {
      this.trips = res;
      this.activeTrip = this.trips.find(t => t.status === 'on-going');

      const scheduledTrips = this.trips
        .filter(t => t.status === 'scheduled')
        .sort((a, b) => new Date(a.schedule.departure_time).getTime() - new Date(b.schedule.departure_time).getTime());

      if (scheduledTrips.length > 0) {
        this.nextTrip = scheduledTrips[0];
        this.laterTrips = scheduledTrips.slice(1);
        this.applySearch();
      } else {
        this.nextTrip = null;
        this.laterTrips = [];
        this.filteredLaterTrips = [];
      }
    });
  }

  applySearch() {
    const term = (this.searchTerm || '').toLowerCase().trim();
    if (!term) {
      this.filteredLaterTrips = [...this.laterTrips];
      return;
    }

    this.filteredLaterTrips = this.laterTrips.filter(t => {
      const o = (t.schedule?.origin || '').toLowerCase();
      const d = (t.schedule?.destination || '').toLowerCase();
      const v = (t.schedule?.vehicle?.license_plate || '').toLowerCase();
      return o.includes(term) || d.includes(term) || v.includes(term);
    });
  }

  getStatusColor(status: string) {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'on-going': return 'success';
      case 'completed': return 'medium';
      default: return 'light';
    }
  }

  startTrip(trip: any) {
    this.api.post(`trips/${trip.id}/start`, {}).subscribe({
      next: () => {
        this.router.navigate(['/driver-tracking', { id: trip.id }]);
      },
      error: (err) => {
        // Fallback alert using native DOM since we might not have UiService injected
        const msg = err.error?.message || 'Gagal memulai perjalanan';
        alert(msg);
      }
    });
  }

  completeTrip(trip: any) {
    this.api.post(`trips/${trip.id}/complete`, {}).subscribe(() => {
      this.loadTrips();
    });
  }

  updateLocation() {
    if (!this.activeTrip) return;

    // Simulate location update for demo
    const lat = -6.2088 + (Math.random() - 0.5) * 0.01;
    const lng = 106.8456 + (Math.random() - 0.5) * 0.01;

    this.api.post(`trips/${this.activeTrip.id}/location`, {
      latitude: lat,
      longitude: lng
    }).subscribe(() => {
      console.log('Location updated');
    });
  }
}
