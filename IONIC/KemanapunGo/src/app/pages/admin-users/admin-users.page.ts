import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  created_at: string;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.page.html',
  styleUrls: ['./admin-users.page.scss'],
  standalone: false
})
export class AdminUsersPage implements OnInit, OnDestroy {
  private adminService = inject(AdminService);
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);
  private fb = inject(FormBuilder);

  users: User[] = [];
  pagination: PaginationData = {
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0
  };

  loading = false;
  error: string | null = null;

  filterRole = '';
  searchQuery = '';
  roles = ['customer', 'driver', 'admin'];

  userForm!: FormGroup;
  editingUser: User | null = null;

  private destroy$ = new Subject<void>();

  constructor() {
    this.initializeForm();
  }

  ngOnInit() {
    this.loadUsers();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeForm() {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      role: ['customer', Validators.required],
      password: ['', [Validators.minLength(6)]]
    });
  }

  loadUsers(page: number = 1) {
    this.loading = true;
    this.error = null;

    this.adminService.getUsers(
      this.filterRole || undefined,
      this.searchQuery || undefined,
      this.pagination.per_page,
      page
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.users = response.data || [];
          this.pagination = response.pagination || {
            current_page: page,
            last_page: 1,
            per_page: 20,
            total: this.users.length
          };
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load users';
          console.error(err);
          this.loading = false;
        }
      });
  }

  onSearchChange() {
    this.pagination.current_page = 1;
    this.loadUsers(1);
  }

  onFilterChange() {
    this.pagination.current_page = 1;
    this.loadUsers(1);
  }

  nextPage() {
    if (this.pagination.current_page < this.pagination.last_page) {
      this.loadUsers(this.pagination.current_page + 1);
    }
  }

  prevPage() {
    if (this.pagination.current_page > 1) {
      this.loadUsers(this.pagination.current_page - 1);
    }
  }

  async openCreateModal() {
    this.editingUser = null;
    this.userForm.reset({ role: 'customer' });
    await this.showFormModal();
  }

  async openEditModal(user: User) {
    this.editingUser = user;
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    });
    this.userForm.get('password')?.clearAsyncValidators();
    await this.showFormModal();
  }

  private async showFormModal() {
    const modal = await this.modalCtrl.create({
      component: UserFormModalComponent,
      componentProps: {
        form: this.userForm,
        user: this.editingUser,
        roles: this.roles
      },
      cssClass: 'user-form-modal'
    });

    await modal.present();
    const result = await modal.onDidDismiss();

    if (result.role === 'confirm' && this.userForm.valid) {
      this.saveUser();
    }
  }

  saveUser() {
    if (!this.userForm.valid) return;

    const formData = this.userForm.value;
    const request = this.editingUser
      ? this.adminService.updateUser(this.editingUser.id, formData)
      : this.adminService.createUser(formData);

    request
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadUsers(this.pagination.current_page);
        },
        error: (err) => {
          this.error = `Failed to ${this.editingUser ? 'update' : 'create'} user`;
          console.error(err);
        }
      });
  }

  async deleteUser(user: User) {
    const alert = await this.alertCtrl.create({
      header: 'Delete User',
      message: `Are you sure you want to delete ${user.name}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.adminService.deleteUser(user.id)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: () => {
                  this.loadUsers(this.pagination.current_page);
                },
                error: (err) => {
                  this.error = 'Failed to delete user';
                  console.error(err);
                }
              });
          }
        }
      ]
    });

    await alert.present();
  }

  getRoleBadgeColor(role: string): string {
    const colors: { [key: string]: string } = {
      'admin': 'danger',
      'driver': 'warning',
      'customer': 'success'
    };
    return colors[role] || 'medium';
  }

  getStatusBadgeColor(status: string): string {
    return status === 'active' ? 'success' : 'medium';
  }
}

@Component({
  selector: 'app-user-form-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ user ? 'Edit User' : 'Create User' }}</ion-title>
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
          <ion-label position="floating">Name</ion-label>
          <ion-input formControlName="name" placeholder="Enter user name"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Email</ion-label>
          <ion-input formControlName="email" type="email" placeholder="Enter email"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Phone</ion-label>
          <ion-input formControlName="phone" placeholder="Enter phone number"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Role</ion-label>
          <ion-select formControlName="role">
            <ion-select-option *ngFor="let role of roles" [value]="role">
              {{ role | titlecase }}
            </ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item *ngIf="!user">
          <ion-label position="floating">Password</ion-label>
          <ion-input formControlName="password" type="password" placeholder="Enter password"></ion-input>
        </ion-item>
      </form>
    </ion-content>
  `,
  standalone: false
})
export class UserFormModalComponent {
  private modalCtrl = inject(ModalController);

  form!: FormGroup;
  user: User | null = null;
  roles: string[] = [];

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
