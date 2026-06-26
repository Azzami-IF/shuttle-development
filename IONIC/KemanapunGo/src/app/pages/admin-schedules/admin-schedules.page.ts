import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Schedule {
  id: number;
  vehicle_id: number;
  driver_id: number;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  total_seats: number;
  available_seats: number;
  price: number;
  vehicle_info?: { make: string; model: string };
  driver_info?: { name: string };
  created_at: string;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

@Component({
  selector: 'app-admin-schedules',
  templateUrl: './admin-schedules.page.html',
  styleUrls: ['./admin-schedules.page.scss'],
  standalone: false
})
export class AdminSchedulesPage implements OnInit, OnDestroy {
  private adminService = inject(AdminService);
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private ui = inject(UiService);

  schedules: Schedule[] = [];
  pagination: PaginationData = {
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0
  };

  loading = false;
  error: string | null = null;
  searchQuery = '';

  scheduleForm!: FormGroup;
  editingSchedule: Schedule | null = null;

  private destroy$ = new Subject<void>();

  constructor() {
    this.initializeForm();
  }

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
    this.loadSchedules();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeForm() {
    this.scheduleForm = this.fb.group({
      vehicle_id: ['', Validators.required],
      driver_id: ['', Validators.required],
      origin: ['', Validators.required],
      destination: ['', Validators.required],
      departure_time: ['', Validators.required],
      arrival_time: ['', Validators.required],
      total_seats: [4, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]]
    });
  }

  loadSchedules(page: number = 1) {
    this.loading = true;
    this.error = null;

    this.adminService.getSchedules(
      this.searchQuery || undefined,
      this.pagination.per_page,
      page
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.schedules = response.data || [];
          this.pagination = response.pagination || {
            current_page: page,
            last_page: 1,
            per_page: 20,
            total: this.schedules.length
          };
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load schedules';
          console.error(err);
          this.loading = false;
        }
      });
  }

  onSearchChange() {
    this.pagination.current_page = 1;
    this.loadSchedules(1);
  }

  nextPage() {
    if (this.pagination.current_page < this.pagination.last_page) {
      this.loadSchedules(this.pagination.current_page + 1);
    }
  }

  prevPage() {
    if (this.pagination.current_page > 1) {
      this.loadSchedules(this.pagination.current_page - 1);
    }
  }

  async openCreateModal() {
    this.editingSchedule = null;
    this.scheduleForm.reset({ total_seats: 4 });
    await this.showFormModal();
  }

  private async showFormModal() {
    const modal = await this.modalCtrl.create({
      component: ScheduleFormModalComponent,
      componentProps: {
        form: this.scheduleForm,
        schedule: this.editingSchedule
      },
      cssClass: 'schedule-form-modal'
    });

    await modal.present();
    const result = await modal.onDidDismiss();

    if (result.role === 'confirm' && this.scheduleForm.valid) {
      this.saveSchedule();
    }
  }

  saveSchedule() {
    if (!this.scheduleForm.valid) return;

    const formData = this.scheduleForm.value;
    const request = this.adminService.createSchedule(formData);

    request
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadSchedules(this.pagination.current_page);
        },
        error: (err) => {
          this.error = 'Failed to create schedule';
          console.error(err);
        }
      });
  }

  async deleteSchedule(schedule: Schedule) {
    const alert = await this.alertCtrl.create({
      header: 'Delete Schedule',
      message: `Are you sure you want to delete this schedule (${schedule.origin} → ${schedule.destination})?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.adminService.deleteSchedule(schedule.id)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: () => {
                  this.loadSchedules(this.pagination.current_page);
                },
                error: (err) => {
                  this.error = 'Failed to delete schedule';
                  console.error(err);
                }
              });
          }
        }
      ]
    });

    await alert.present();
  }

  getSeatsAvailabilityColor(available: number, total: number): string {
    const percentage = (available / total) * 100;
    if (percentage > 50) return 'success';
    if (percentage > 20) return 'warning';
    return 'danger';
  }

  getVehicleDisplay(schedule: Schedule): string {
    if (schedule.vehicle_info) {
      return `${schedule.vehicle_info.make} ${schedule.vehicle_info.model}`;
    }
    return `Vehicle #${schedule.vehicle_id}`;
  }

  getDriverDisplay(schedule: Schedule): string {
    if (schedule.driver_info) {
      return schedule.driver_info.name;
    }
    return `Driver #${schedule.driver_id}`;
  }
}

@Component({
  selector: 'app-schedule-form-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Create Schedule</ion-title>
        <ion-buttons slot="start">
          <ion-button (click)="dismiss()">Cancel</ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button (click)="confirm()" [disabled]="!form.valid">Save</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form [formGroup]="form">
        <ion-item>
          <ion-label position="floating">Vehicle ID</ion-label>
          <ion-input formControlName="vehicle_id" type="number"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Driver ID</ion-label>
          <ion-input formControlName="driver_id" type="number"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Origin</ion-label>
          <ion-input formControlName="origin" placeholder="Starting location"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Destination</ion-label>
          <ion-input formControlName="destination" placeholder="Ending location"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Departure Time</ion-label>
          <ion-input formControlName="departure_time" type="datetime-local"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Arrival Time</ion-label>
          <ion-input formControlName="arrival_time" type="datetime-local"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Total Seats</ion-label>
          <ion-input formControlName="total_seats" type="number" min="1"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Price</ion-label>
          <ion-input formControlName="price" type="number" step="0.01"></ion-input>
        </ion-item>
      </form>
    </ion-content>
  `,
  standalone: false
})
export class ScheduleFormModalComponent {
  private modalCtrl = inject(ModalController);

  form!: FormGroup;
  schedule: Schedule | null = null;

  constructor() { }

  dismiss() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    if (this.form.valid) {
      this.modalCtrl.dismiss(null, 'confirm');
    }
  }
}
