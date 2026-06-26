import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Booking {
  id: number;
  user_id: number;
  schedule_id: number;
  number_of_seats: number;
  total_price: number;
  status: string;
  payment_method: string;
  payment_reference: string;
  created_at: string;
  user_info?: { name: string; email: string; phone: string };
  schedule_info?: { origin: string; destination: string; departure_time: string };
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

@Component({
  selector: 'app-admin-bookings',
  templateUrl: './admin-bookings.page.html',
  styleUrls: ['./admin-bookings.page.scss'],
  standalone: false
})
export class AdminBookingsPage implements OnInit, OnDestroy {
  private adminService = inject(AdminService);
  private alertCtrl = inject(AlertController);

  bookings: Booking[] = [];
  pagination: PaginationData = {
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0
  };

  loading = false;
  error: string | null = null;
  filterStatus = '';
  searchQuery = '';
  statuses = ['pending_payment', 'booked', 'cancelled', 'completed'];

  selectedBooking: Booking | null = null;
  showDetails = false;

  private destroy$ = new Subject<void>();

  constructor() { }

  ngOnInit() {
    this.loadBookings();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBookings(page: number = 1) {
    this.loading = true;
    this.error = null;

    this.adminService.getBookings(
      this.filterStatus || undefined,
      this.searchQuery || undefined,
      this.pagination.per_page,
      page
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.bookings = response.data || [];
          this.pagination = response.pagination || {
            current_page: page,
            last_page: 1,
            per_page: 20,
            total: this.bookings.length
          };
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load bookings';
          console.error(err);
          this.loading = false;
        }
      });
  }

  onSearchChange() {
    this.pagination.current_page = 1;
    this.loadBookings(1);
  }

  onFilterChange() {
    this.pagination.current_page = 1;
    this.loadBookings(1);
  }

  nextPage() {
    if (this.pagination.current_page < this.pagination.last_page) {
      this.loadBookings(this.pagination.current_page + 1);
    }
  }

  prevPage() {
    if (this.pagination.current_page > 1) {
      this.loadBookings(this.pagination.current_page - 1);
    }
  }

  viewDetails(booking: Booking) {
    this.selectedBooking = booking;
    this.showDetails = true;
  }

  closeDetails() {
    this.showDetails = false;
    this.selectedBooking = null;
  }

  async approveBooking(booking: Booking) {
    if (booking.status !== 'pending_payment') {
      const alert = await this.alertCtrl.create({
        header: 'Cannot Approve',
        message: 'Only pending bookings can be approved.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Approve Booking',
      message: 'Confirm payment for this booking?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Approve',
          role: 'confirm',
          handler: () => {
            this.adminService.approveBooking(booking.id)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: () => {
                  this.loadBookings(this.pagination.current_page);
                  this.closeDetails();
                },
                error: (err) => {
                  this.error = 'Failed to approve booking';
                  console.error(err);
                }
              });
          }
        }
      ]
    });

    await alert.present();
  }

  async cancelBooking(booking: Booking) {
    const alert = await this.alertCtrl.create({
      header: 'Cancel Booking',
      message: 'Are you sure you want to cancel this booking?',
      buttons: [
        {
          text: 'Keep',
          role: 'cancel'
        },
        {
          text: 'Cancel Booking',
          role: 'destructive',
          handler: () => {
            this.adminService.cancelBooking(booking.id)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: () => {
                  this.loadBookings(this.pagination.current_page);
                  this.closeDetails();
                },
                error: (err) => {
                  this.error = 'Failed to cancel booking';
                  console.error(err);
                }
              });
          }
        }
      ]
    });

    await alert.present();
  }

  getStatusBadgeColor(status: string): string {
    const colors: { [key: string]: string } = {
      'booked': 'success',
      'pending_payment': 'warning',
      'cancelled': 'danger',
      'completed': 'medium'
    };
    return colors[status] || 'medium';
  }

  getUserDisplay(booking: Booking): string {
    if (booking.user_info) {
      return booking.user_info.name;
    }
    return `User #${booking.user_id}`;
  }

  getRouteDisplay(booking: Booking): string {
    if (booking.schedule_info) {
      return `${booking.schedule_info.origin} → ${booking.schedule_info.destination}`;
    }
    return `Schedule #${booking.schedule_id}`;
  }

  getDepartureTime(booking: Booking): string {
    if (booking.schedule_info) {
      return booking.schedule_info.departure_time;
    }
    return '-';
  }
}
