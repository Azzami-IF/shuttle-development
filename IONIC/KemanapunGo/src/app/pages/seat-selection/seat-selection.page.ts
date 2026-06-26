import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { UiService } from '../../services/ui.service';
import { LanguageService } from '../../services/language.service';

@Component({
  standalone: false,
  selector: 'app-seat-selection',
  templateUrl: './seat-selection.page.html',
  styleUrls: ['./seat-selection.page.scss'],
})
export class SeatSelectionPage implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private router = inject(Router);
  private ui = inject(UiService);
  private languageService = inject(LanguageService);

  scheduleId: any;
  schedule: any;
  rows: any[] = [];
  loading: boolean = false;
  selectedSeatIds: any[] = [];
  price: number = 0;
  lang$ = this.languageService.lang$;

  constructor() {}

  ngOnInit() {
    this.scheduleId = this.route.snapshot.paramMap.get('id');
    this.loadSchedule();
  }

  loadSchedule() {
    this.loading = true;
    this.api.get(`schedules/${this.scheduleId}`).subscribe((res: any) => {
      this.schedule = res;
      this.price = res.price || 85000; // Fallback price
      this.organizeSeats(res.seats || []);
      this.loading = false;
    }, () => { this.loading = false; });
  }

  organizeSeats(seats: any[]) {
    // Map backend numbers (1, 2, 3...) to grid labels (1A, 1B, 1C, 1D)
    const rowMap = new Map();

    seats.forEach((seat, index) => {
      const rowNum = Math.floor(index / 4) + 1;
      const colIndex = index % 4;
      const letters = ['A', 'B', 'C', 'D'];
      const label = `${rowNum}${letters[colIndex]}`;

      const mappedSeat = {
        id: seat.id,
        label: label,
        is_occupied: seat.status === 'booked'
      };

      if (!rowMap.has(rowNum)) {
        rowMap.set(rowNum, { left: [], right: [] });
      }

      const row = rowMap.get(rowNum);
      if (colIndex < 2) {
        row.left.push(mappedSeat);
      } else {
        row.right.push(mappedSeat);
      }
    });

    this.rows = Array.from(rowMap.values());
  }

  selectSeat(seatId: any) {
    const index = this.selectedSeatIds.indexOf(seatId);
    if (index > -1) {
      this.selectedSeatIds.splice(index, 1);
    } else {
      this.selectedSeatIds.push(seatId);
    }
  }

  getSelectedSeatLabels() {
    if (this.selectedSeatIds.length === 0) return this.getTranslation('notSelected');
    const labels: string[] = [];
    this.selectedSeatIds.forEach(id => {
      for (let row of this.rows) {
        const found = row.left.find((s: any) => s.id === id) || row.right.find((s: any) => s.id === id);
        if (found) labels.push(found.label);
      }
    });
    return labels.join(', ');
  }

  getTotalPrice() {
    return this.selectedSeatIds.length * this.price;
  }

  getTranslation(key: string) {
    return this.languageService.get(key);
  }

  confirmBooking() {
    if (this.selectedSeatIds.length === 0) return;
    this.loading = true;
    this.api.post('bookings', {
      schedule_id: this.scheduleId,
      seat_ids: this.selectedSeatIds
    }).subscribe({
      next: (res: any) => {
        this.loading = false;
        // Navigate to payment page with the new booking ID
        this.router.navigate(['/payment', { id: res.id }]);
      },
      error: (err: any) => {
        this.loading = false;
        void this.ui.showAlert('Booking Gagal', this.ui.getErrorMessage(err, 'Unknown error'));
      }
    });
  }

  goBack() {
    window.history.back();
  }
}
