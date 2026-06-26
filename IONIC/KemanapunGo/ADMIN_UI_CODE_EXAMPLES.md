# Admin UI Code Examples & Common Tasks

## Common Development Tasks

### 1. Navigate Between Admin Pages

**From Component**:
```typescript
import { Router } from '@angular/router';

export class AdminDashboardPage {
  constructor(private router: Router) {}

  navigateTo(page: string) {
    this.router.navigate([`/admin/${page}`]);
  }

  goToUsers() {
    this.router.navigate(['/admin/admin-users']);
  }

  goToDashboard() {
    this.router.navigate(['/admin/dashboard']);
  }
}
```

**From Template**:
```html
<ion-button (click)="navigateTo('admin-users')">
  Go to Users
</ion-button>

<ion-button routerLink="/admin/admin-drivers">
  Go to Drivers
</ion-button>
```

---

### 2. Adding a New Filter

**Example: Add status filter to users**

**Step 1: Update Component TypeScript**
```typescript
export class AdminUsersPage {
  filterStatus = '';
  statuses = ['active', 'inactive', 'suspended'];

  onStatusFilterChange() {
    this.pagination.current_page = 1;
    this.loadUsers(1);
  }

  loadUsers(page: number = 1) {
    this.adminService.getUsers(
      this.filterRole || undefined,
      this.searchQuery || undefined,
      this.filterStatus || undefined,  // Add new parameter
      this.pagination.per_page,
      page
    ).subscribe({
      // ... handle response
    });
  }
}
```

**Step 2: Update Component Template**
```html
<ion-item>
  <ion-label position="floating">Filter by status</ion-label>
  <ion-select [(ngModel)]="filterStatus" (ionChange)="onStatusFilterChange()">
    <ion-select-option value="">All Statuses</ion-select-option>
    <ion-select-option *ngFor="let status of statuses" [value]="status">
      {{ status | titlecase }}
    </ion-select-option>
  </ion-select>
</ion-item>
```

---

### 3. Customize Table Columns

**Example: Show more fields in user list**

**Before**:
```html
<ion-label>
  <div class="user-name">{{ user.name }}</div>
  <div class="user-details">
    <span>{{ user.email }}</span> · <span>{{ user.phone }}</span>
  </div>
</ion-label>
```

**After (with additional fields)**:
```html
<ion-label>
  <div class="user-name">{{ user.name }}</div>
  <div class="user-details">
    <span>{{ user.email }}</span> · 
    <span>{{ user.phone }}</span> · 
    <span>{{ user.status }}</span> · 
    <span>{{ user.created_at | date: 'short' }}</span>
  </div>
</ion-label>
```

---

### 4. Change Pagination Size

**Example: Show 50 items per page instead of 20**

```typescript
export class AdminUsersPage {
  pagination: PaginationData = {
    current_page: 1,
    last_page: 1,
    per_page: 50,  // Changed from 20
    total: 0
  };

  loadUsers(page: number = 1) {
    this.adminService.getUsers(
      this.filterRole || undefined,
      this.searchQuery || undefined,
      this.pagination.per_page,  // Now 50
      page
    ).subscribe({ /* ... */ });
  }
}
```

---

### 5. Add Custom Styling to Cards

**Example: Add red border to error state**

```scss
.error-card {
  margin-bottom: 16px;
  background: #ffebee;
  border-left: 4px solid #f44336;
  border-radius: 8px;

  ion-card-content {
    color: #c62828;
    font-weight: 500;
  }
}

// Apply to specific card
.custom-card {
  border: 2px solid #3880ff;
  box-shadow: 0 4px 12px rgba(56, 128, 255, 0.15);
}
```

---

### 6. Add Auto-Refresh

**Example: Refresh data every 30 seconds**

```typescript
import { interval } from 'rxjs';
import { switchMap, takeUntil, startWith } from 'rxjs/operators';

export class AdminDashboardPage implements OnInit, OnDestroy {
  autoRefresh = true;
  private destroy$ = new Subject<void>();

  ngOnInit() {
    // Initial load
    this.loadDashboardData();

    // Auto-refresh every 30 seconds
    interval(30000)
      .pipe(
        startWith(0),  // Start immediately
        switchMap(() => {
          if (this.autoRefresh) {
            return this.adminService.getDashboardStats();
          }
          return [];
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data) => {
          this.stats = data;
        }
      });
  }

  toggleAutoRefresh() {
    this.autoRefresh = !this.autoRefresh;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

---

### 7. Add Form Validation

**Example: Add custom validators**

```typescript
import { FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

export class AdminUsersPage {
  userForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.initializeForm();
  }

  initializeForm() {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, this.phoneValidator]],
      role: ['customer', Validators.required],
      password: ['', [Validators.minLength(8), Validators.required]]
    });
  }

  // Custom validator
  phoneValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const phoneRegex = /^[0-9\-\+\s\(\)]+$/;
    return phoneRegex.test(control.value) ? null : { invalidPhone: true };
  }

  get nameError(): string | null {
    const control = this.userForm.get('name');
    if (control?.hasError('required')) return 'Name is required';
    if (control?.hasError('minlength')) return 'Name must be at least 2 characters';
    return null;
  }

  get emailError(): string | null {
    const control = this.userForm.get('email');
    if (control?.hasError('required')) return 'Email is required';
    if (control?.hasError('email')) return 'Invalid email format';
    return null;
  }
}
```

**In Template**:
```html
<ion-item>
  <ion-label position="floating">Name</ion-label>
  <ion-input formControlName="name"></ion-input>
</ion-item>
<div class="error-text" *ngIf="nameError">
  {{ nameError }}
</div>
```

---

### 8. Add Loading Overlay

**Example: Show loading modal during save**

```typescript
import { LoadingController } from '@ionic/angular';

export class AdminUsersPage {
  constructor(
    private loadingCtrl: LoadingController,
    private adminService: AdminService
  ) {}

  async saveUser() {
    if (!this.userForm.valid) return;

    const loading = await this.loadingCtrl.create({
      message: 'Saving user...',
      spinner: 'circular'
    });
    await loading.present();

    const formData = this.userForm.value;
    const request = this.editingUser
      ? this.adminService.updateUser(this.editingUser.id, formData)
      : this.adminService.createUser(formData);

    request.subscribe({
      next: () => {
        loading.dismiss();
        this.loadUsers(this.pagination.current_page);
      },
      error: (err) => {
        loading.dismiss();
        this.error = 'Failed to save user';
        console.error(err);
      }
    });
  }
}
```

---

### 9. Add Toast Notifications

**Example: Show success/error messages**

```typescript
import { ToastController } from '@ionic/angular';

export class AdminUsersPage {
  constructor(private toastCtrl: ToastController) {}

  async showToast(message: string, color: string = 'success', duration: number = 2000) {
    const toast = await this.toastCtrl.create({
      message,
      color,
      duration,
      position: 'top'
    });
    await toast.present();
  }

  async deleteUser(user: User) {
    // ... delete logic
    this.adminService.deleteUser(user.id).subscribe({
      next: () => {
        this.showToast('User deleted successfully', 'success');
        this.loadUsers(this.pagination.current_page);
      },
      error: () => {
        this.showToast('Failed to delete user', 'danger');
      }
    });
  }
}
```

---

### 10. Extend Component with New Data

**Example: Add last login date to users**

**Assuming API returns `last_login`**:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  last_login: string;  // Add this
  created_at: string;
}
```

**In Template**:
```html
<ion-item *ngFor="let user of users">
  <ion-label>
    <div class="user-name">{{ user.name }}</div>
    <div class="user-details">
      <span>Last Login: {{ user.last_login | date: 'MMM dd, HH:mm' }}</span>
    </div>
  </ion-label>
</ion-item>
```

---

### 11. Export Data to CSV

**Example: Export users list**

```typescript
export class AdminUsersPage {
  exportToCsv() {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'Status'];
    const rows = this.users.map(user => [
      user.id,
      user.name,
      user.email,
      user.phone,
      user.role,
      user.status
    ]);

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `users_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
  }
}
```

**In Template**:
```html
<ion-button (click)="exportToCsv()" color="secondary">
  <ion-icon name="download" slot="start"></ion-icon>
  Export as CSV
</ion-button>
```

---

### 12. Add Date Range Filter

**Example: Filter bookings by date range**

```typescript
export class AdminBookingsPage {
  startDate = '';
  endDate = '';
  bookings: Booking[] = [];

  onDateRangeChange() {
    this.loadBookings(1);
  }

  loadBookings(page: number = 1) {
    // Add date filtering to API call
    // Assuming API accepts start_date and end_date
    const params = {
      per_page: this.pagination.per_page,
      page: page,
      ...(this.startDate && { start_date: this.startDate }),
      ...(this.endDate && { end_date: this.endDate })
    };

    this.adminService.getBookingsWithFilters(params).subscribe({
      next: (response) => {
        this.bookings = response.data || [];
      }
    });
  }
}
```

**In Template**:
```html
<ion-item>
  <ion-label>Start Date</ion-label>
  <ion-input [(ngModel)]="startDate" (ionChange)="onDateRangeChange()" type="date"></ion-input>
</ion-item>
<ion-item>
  <ion-label>End Date</ion-label>
  <ion-input [(ngModel)]="endDate" (ionChange)="onDateRangeChange()" type="date"></ion-input>
</ion-item>
```

---

### 13. Add Search with Debounce

**Example: Debounce user search**

```typescript
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

export class AdminUsersPage {
  private searchSubject = new Subject<string>();
  searchQuery = '';

  constructor(private adminService: AdminService) {
    // Setup search with debounce
    this.searchSubject
      .pipe(
        debounceTime(500),  // Wait 500ms after typing stops
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.pagination.current_page = 1;
        this.loadUsers(1);
      });
  }

  onSearchChange() {
    this.searchSubject.next(this.searchQuery);
  }
}
```

---

### 14. Add Bulk Actions

**Example: Bulk delete users**

```typescript
export class AdminUsersPage {
  selectedUsers: User[] = [];
  selectAll = false;

  toggleSelectAll() {
    if (this.selectAll) {
      this.selectedUsers = [...this.users];
    } else {
      this.selectedUsers = [];
    }
  }

  toggleUserSelection(user: User) {
    const index = this.selectedUsers.indexOf(user);
    if (index > -1) {
      this.selectedUsers.splice(index, 1);
    } else {
      this.selectedUsers.push(user);
    }
  }

  async bulkDeleteUsers() {
    if (this.selectedUsers.length === 0) return;

    const alert = await this.alertCtrl.create({
      header: 'Bulk Delete',
      message: `Delete ${this.selectedUsers.length} users?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete All',
          role: 'destructive',
          handler: () => {
            this.selectedUsers.forEach(user => {
              this.adminService.deleteUser(user.id).subscribe();
            });
            this.selectedUsers = [];
            this.loadUsers(this.pagination.current_page);
          }
        }
      ]
    });
    await alert.present();
  }
}
```

---

### 15. Add Caching

**Example: Cache API responses**

```typescript
import { shareReplay } from 'rxjs/operators';

export class AdminUsersPage {
  private usersCache$ = new Map<string, Observable<any>>();

  loadUsers(page: number = 1) {
    const cacheKey = `users_${page}`;

    if (this.usersCache$.has(cacheKey)) {
      this.usersCache$.get(cacheKey)!.subscribe({
        next: (response) => {
          this.users = response.data;
        }
      });
      return;
    }

    const request$ = this.adminService.getUsers(
      this.filterRole || undefined,
      this.searchQuery || undefined,
      this.pagination.per_page,
      page
    ).pipe(
      shareReplay(1)  // Cache and share the result
    );

    this.usersCache$.set(cacheKey, request$);

    request$.subscribe({
      next: (response) => {
        this.users = response.data || [];
      }
    });
  }

  clearCache() {
    this.usersCache$.clear();
  }
}
```

---

## Tips for Customization

1. **Reuse Components**: Extract common patterns into separate components
2. **Type Safety**: Always define interfaces for data structures
3. **Error Handling**: Always include error handling in subscriptions
4. **Memory Management**: Use `takeUntil` for subscription cleanup
5. **Performance**: Use `trackBy` in `*ngFor` loops for large lists
6. **Accessibility**: Add `aria-labels` for screen readers
7. **Testing**: Write unit tests for components and services
8. **Documentation**: Keep code well-commented
9. **Styling**: Use CSS variables for consistent theming
10. **Mobile First**: Test on mobile before desktop

---

**Last Updated**: 2024  
**Version**: 1.0
