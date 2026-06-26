import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface DashboardStats {
  total_vehicles: number;
  total_schedules: number;
  total_bookings: number;
  total_users: number;
  total_drivers: number;
  active_trips: number;
}

interface BookingData {
  date: string;
  bookings: number;
}

interface RevenueData {
  date: string;
  revenue: number;
}

interface SystemHealth {
  status: string;
  database: string;
  api: string;
  memory_usage: number;
  cpu_usage: number;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  standalone: false
})
export class AdminDashboardPage implements OnInit, OnDestroy {
  private adminService = inject(AdminService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private ui = inject(UiService);

  stats: DashboardStats | null = null;
  bookingData: BookingData[] = [];
  revenueData: RevenueData[] = [];
  systemHealth: SystemHealth | null = null;
  loading = true;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  constructor() { }

  async confirmLogout() {
    const confirmed = await this.ui.showConfirm('Keluar Akun', 'Apakah Anda yakin ingin keluar dari sesi admin?', 'Keluar');
    if (confirmed) {
      this.authService.logout().subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Logout failed, forcing local logout', err);
          this.authService.logoutDirect();
          this.router.navigate(['/login']);
        }
      });
    }
  }

  ngOnInit() {
    this.loadDashboardData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData() {
    this.loading = true;
    this.error = null;

    this.adminService.getDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.stats = data;
        },
        error: (err) => {
          this.error = 'Failed to load dashboard statistics';
          console.error(err);
        }
      });

    this.adminService.getDashboardBookings(7)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.bookingData = data.data || [];
        },
        error: (err) => {
          console.error('Failed to load booking data', err);
        }
      });

    this.adminService.getDashboardRevenue(30)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.revenueData = data.data || [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load revenue data', err);
          this.loading = false;
        }
      });

    this.adminService.getSystemHealth()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.systemHealth = data;
        },
        error: (err) => {
          console.error('Failed to load system health', err);
        }
      });
  }

  refresh() {
    this.loadDashboardData();
  }

  navigateTo(page: string) {
    this.router.navigate([`/admin/${page}`]);
  }

  getHealthStatusColor(): string {
    if (!this.systemHealth) return 'medium';
    return this.systemHealth.status === 'healthy' ? 'success' : 'danger';
  }

  getBookingChartData(): any {
    return {
      labels: this.bookingData.map(d => d.date),
      datasets: [{
        label: 'Bookings',
        data: this.bookingData.map(d => d.bookings),
        borderColor: '#3880ff',
        backgroundColor: 'rgba(56, 128, 255, 0.1)',
        borderWidth: 2,
        tension: 0.4
      }]
    };
  }

  getRevenueChartData(): any {
    return {
      labels: this.revenueData.map(d => d.date),
      datasets: [{
        label: 'Revenue',
        data: this.revenueData.map(d => d.revenue),
        borderColor: '#2dd36f',
        backgroundColor: 'rgba(45, 211, 111, 0.1)',
        borderWidth: 2,
        tension: 0.4
      }]
    };
  }
}
