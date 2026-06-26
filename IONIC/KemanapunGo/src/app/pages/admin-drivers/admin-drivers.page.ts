import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Driver {
  id: number;
  name: string;
  email: string;
  phone: string;
  vehicle_id: number | null;
  license_number: string;
  status: string;
  is_approved: boolean;
  total_trips: number;
  completed_trips: number;
  rating: number;
  created_at: string;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

@Component({
  selector: 'app-admin-drivers',
  templateUrl: './admin-drivers.page.html',
  styleUrls: ['./admin-drivers.page.scss'],
  standalone: false
})
export class AdminDriversPage implements OnInit, OnDestroy {
  private adminService = inject(AdminService);
  private alertCtrl = inject(AlertController);
  private router = inject(Router);
  private authService = inject(AuthService);
  private ui = inject(UiService);

  drivers: Driver[] = [];
  pagination: PaginationData = {
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0
  };

  loading = false;
  error: string | null = null;
  selectedDriver: Driver | null = null;
  showDetails = false;

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
    this.loadDrivers();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDrivers(page: number = 1) {
    this.loading = true;
    this.error = null;

    this.adminService.getDrivers(this.pagination.per_page, page)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.drivers = response.data || [];
          this.pagination = response.pagination || {
            current_page: page,
            last_page: 1,
            per_page: 20,
            total: this.drivers.length
          };
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load drivers';
          console.error(err);
          this.loading = false;
        }
      });
  }

  nextPage() {
    if (this.pagination.current_page < this.pagination.last_page) {
      this.loadDrivers(this.pagination.current_page + 1);
    }
  }

  prevPage() {
    if (this.pagination.current_page > 1) {
      this.loadDrivers(this.pagination.current_page - 1);
    }
  }

  viewDetails(driver: Driver) {
    this.selectedDriver = driver;
    this.showDetails = true;
  }

  closeDetails() {
    this.showDetails = false;
    this.selectedDriver = null;
  }

  async approveDriver(driver: Driver) {
    if (driver.is_approved) {
      const alert = await this.alertCtrl.create({
        header: 'Already Approved',
        message: 'This driver is already approved.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Approve Driver',
      message: `Approve ${driver.name} as a driver?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Approve',
          role: 'confirm',
          handler: () => {
            this.adminService.approveDriver(driver.id)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: () => {
                  this.loadDrivers(this.pagination.current_page);
                  this.closeDetails();
                },
                error: (err) => {
                  this.error = 'Failed to approve driver';
                  console.error(err);
                }
              });
          }
        }
      ]
    });

    await alert.present();
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'active': 'success',
      'inactive': 'medium',
      'suspended': 'danger'
    };
    return colors[status] || 'medium';
  }

  getApprovalBadgeColor(isApproved: boolean): string {
    return isApproved ? 'success' : 'warning';
  }

  getCompletionRate(driver: Driver): number {
    if (driver.total_trips === 0) return 0;
    return Math.round((driver.completed_trips / driver.total_trips) * 100);
  }
}
