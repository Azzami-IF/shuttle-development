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

interface Vehicle {
  id: number;
  license_plate: string;
  name: string;
  capacity: number;
  created_at: string;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

@Component({
  selector: 'app-admin-vehicles',
  templateUrl: './admin-vehicles.page.html',
  styleUrls: ['./admin-vehicles.page.scss'],
  standalone: false
})
export class AdminVehiclesPage implements OnInit, OnDestroy {
  private adminService = inject(AdminService);
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private ui = inject(UiService);

  vehicles: Vehicle[] = [];
  pagination: PaginationData = {
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0
  };

  loading = false;
  error: string | null = null;
  searchQuery = '';

  vehicleForm!: FormGroup;
  editingVehicle: Vehicle | null = null;

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
    this.loadVehicles();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeForm() {
    this.vehicleForm = this.fb.group({
      name: ['', Validators.required],
      license_plate: ['', Validators.required],
      capacity: [12, [Validators.required, Validators.min(1)]]
    });
  }

  loadVehicles(page: number = 1) {
    this.loading = true;
    this.error = null;

    this.adminService.getVehicles(
      this.searchQuery || undefined,
      this.pagination.per_page,
      page
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.vehicles = response.data || [];
          this.pagination = response.pagination || {
            current_page: page,
            last_page: 1,
            per_page: 20,
            total: this.vehicles.length
          };
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Gagal memuat data armada';
          console.error(err);
          this.loading = false;
        }
      });
  }

  onSearchChange() {
    this.pagination.current_page = 1;
    this.loadVehicles(1);
  }

  nextPage() {
    if (this.pagination.current_page < this.pagination.last_page) {
      this.loadVehicles(this.pagination.current_page + 1);
    }
  }

  prevPage() {
    if (this.pagination.current_page > 1) {
      this.loadVehicles(this.pagination.current_page - 1);
    }
  }

  async openCreateModal() {
    this.editingVehicle = null;
    this.vehicleForm.reset({ capacity: 12 });
    await this.showFormModal();
  }

  async openEditModal(vehicle: Vehicle) {
    this.editingVehicle = vehicle;
    this.vehicleForm.patchValue({
      name: vehicle.name,
      license_plate: vehicle.license_plate,
      capacity: vehicle.capacity
    });
    await this.showFormModal();
  }

  private async showFormModal() {
    const modal = await this.modalCtrl.create({
      component: VehicleFormModalComponent,
      componentProps: {
        form: this.vehicleForm,
        vehicle: this.editingVehicle
      },
      cssClass: 'vehicle-form-modal'
    });

    await modal.present();
    const result = await modal.onDidDismiss();

    if (result.role === 'confirm' && this.vehicleForm.valid) {
      this.saveVehicle();
    }
  }

  saveVehicle() {
    if (!this.vehicleForm.valid) return;

    const formData = this.vehicleForm.value;
    const request = this.editingVehicle
      ? this.adminService.updateVehicle(this.editingVehicle.id, formData)
      : this.adminService.createVehicle(formData);

    request
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadVehicles(this.pagination.current_page);
        },
        error: (err) => {
          this.error = `Gagal ${this.editingVehicle ? 'menyimpan perubahan' : 'menambah'} armada`;
          console.error(err);
        }
      });
  }

  async deleteVehicle(vehicle: Vehicle) {
    const alert = await this.alertCtrl.create({
      header: 'Hapus Armada',
      message: `Apakah Anda yakin ingin menghapus armada ${vehicle.name} (${vehicle.license_plate})?`,
      buttons: [
        {
          text: 'Batal',
          role: 'cancel'
        },
        {
          text: 'Hapus',
          role: 'destructive',
          handler: () => {
            this.adminService.deleteVehicle(vehicle.id)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: () => {
                  this.loadVehicles(this.pagination.current_page);
                },
                error: (err) => {
                  this.error = 'Gagal menghapus armada';
                  console.error(err);
                }
              });
          }
        }
      ]
    });

    await alert.present();
  }

  getTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'car': 'car-outline',
      'van': 'bus-outline',
      'truck': 'car-sport-outline'
    };
    return icons[type] || 'car-outline';
  }
}

@Component({
  selector: 'app-vehicle-form-modal',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>{{ vehicle ? 'Ubah Data Armada' : 'Tambah Armada Baru' }}</ion-title>
        <ion-buttons slot="start">
          <ion-button (click)="dismiss()">Batal</ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button (click)="confirm()" [disabled]="!form.valid">Simpan</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form [formGroup]="form" (submit)="confirm()">
        <div class="input-group mb-4">
          <label>Nama Armada</label>
          <input type="text" formControlName="name" class="custom-input" placeholder="e.g., Kemanapun Express 01" required />
        </div>
        <div class="input-group mb-4">
          <label>Plat Nomor</label>
          <input type="text" formControlName="license_plate" class="custom-input" placeholder="e.g., B 1234 ABC" required />
        </div>
        <div class="input-group mb-6">
          <label>Kapasitas Kursi</label>
          <input type="number" formControlName="capacity" class="custom-input" min="1" placeholder="12" required />
        </div>
      </form>
    </ion-content>
  `,
  standalone: false
})
export class VehicleFormModalComponent {
  private modalCtrl = inject(ModalController);

  form!: FormGroup;
  vehicle: Vehicle | null = null;

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
