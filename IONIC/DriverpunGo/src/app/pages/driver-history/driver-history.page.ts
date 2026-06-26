import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  standalone: false,
  selector: 'app-driver-history',
  templateUrl: './driver-history.page.html',
  styleUrls: ['./driver-history.page.scss'],
})
export class DriverHistoryPage {
  private api = inject(ApiService);
  private router = inject(Router);

  trips: any[] = [];
  summary = {
    totalTrips: 42,
    totalDistance: 1284
  };

  constructor() {}

  ionViewWillEnter() {
    this.loadHistory();
  }

  loadHistory() {
    this.api.get('trips').subscribe((res: any[]) => {
      this.trips = (res || []).filter(t => t.status === 'completed')
        .sort((a, b) => new Date(b.completed_at || b.updated_at).getTime() - new Date(a.completed_at || a.updated_at).getTime());
      this.summary.totalTrips = this.trips.length;
      this.summary.totalDistance = this.trips.length * 150; // Bandung to Jakarta is approx 150km
    });
  }

  viewTrip(trip: any) {
    this.router.navigate(['/driver-tracking', { id: trip.id }]);
  }
}
