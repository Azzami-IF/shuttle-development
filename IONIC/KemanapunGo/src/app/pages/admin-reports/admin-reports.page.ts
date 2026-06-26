import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface DailyReportData {
  date: string;
  total_bookings: number;
  completed_trips: number;
  total_revenue: number;
  total_distance: number;
  active_drivers: number;
}

interface MonthlyReportData {
  month: string;
  total_bookings: number;
  completed_trips: number;
  total_revenue: number;
  average_rating: number;
  active_drivers: number;
}

@Component({
  selector: 'app-admin-reports',
  templateUrl: './admin-reports.page.html',
  styleUrls: ['./admin-reports.page.scss'],
  standalone: false
})
export class AdminReportsPage implements OnInit, OnDestroy {
  private adminService = inject(AdminService);

  // Daily Report
  selectedDate = new Date().toISOString().split('T')[0];
  dailyReport: DailyReportData | null = null;
  dailyLoading = false;
  dailyError: string | null = null;

  // Monthly Report
  selectedMonth = new Date().toISOString().substring(0, 7);
  monthlyReport: MonthlyReportData | null = null;
  monthlyLoading = false;
  monthlyError: string | null = null;

  private destroy$ = new Subject<void>();

  constructor() { }

  ngOnInit() {
    this.loadDailyReport();
    this.loadMonthlyReport();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDailyReport() {
    this.dailyLoading = true;
    this.dailyError = null;

    this.adminService.getDailyReport(this.selectedDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.dailyReport = data;
          this.dailyLoading = false;
        },
        error: (err) => {
          this.dailyError = 'Failed to load daily report';
          console.error(err);
          this.dailyLoading = false;
        }
      });
  }

  loadMonthlyReport() {
    this.monthlyLoading = true;
    this.monthlyError = null;

    this.adminService.getMonthlyReport(this.selectedMonth)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.monthlyReport = data;
          this.monthlyLoading = false;
        },
        error: (err) => {
          this.monthlyError = 'Failed to load monthly report';
          console.error(err);
          this.monthlyLoading = false;
        }
      });
  }

  onDateChange() {
    this.loadDailyReport();
  }

  onMonthChange() {
    this.loadMonthlyReport();
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getCurrentMonth(): string {
    return new Date().toISOString().substring(0, 7);
  }

  getRevenueColor(): string {
    return 'success';
  }

  getBookingTrendColor(current: number, previous: number): string {
    if (current > previous) return 'success';
    if (current < previous) return 'danger';
    return 'medium';
  }

  getRevenueProgress(report: MonthlyReportData): number {
    return Math.min((report.total_revenue / 100000) * 100, 100);
  }

  getRatingColor(rating: number): string {
    if (rating >= 4.5) return 'success';
    if (rating >= 3.5) return 'warning';
    return 'danger';
  }
}
