import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AdminService } from '../../services/admin.service';
import { Subject, interval } from 'rxjs';
import { takeUntil, switchMap, startWith } from 'rxjs/operators';

interface SystemHealth {
  status: string;
  database: string;
  api: string;
  memory_usage: number;
  cpu_usage: number;
  disk_usage: number;
  uptime: number;
  last_updated: string;
}

interface ActivityLog {
  id: number;
  action: string;
  user: string;
  timestamp: string;
  details: string;
  status: string;
}

interface SystemAlert {
  id: number;
  level: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

@Component({
  selector: 'app-admin-system',
  templateUrl: './admin-system.page.html',
  styleUrls: ['./admin-system.page.scss'],
  standalone: false
})
export class AdminSystemPage implements OnInit, OnDestroy {
  private adminService = inject(AdminService);

  systemHealth: SystemHealth | null = null;
  activityLogs: ActivityLog[] = [];
  systemAlerts: SystemAlert[] = [];

  loading = false;
  error: string | null = null;
  autoRefresh = true;

  private destroy$ = new Subject<void>();

  constructor() {}

  ngOnInit() {
    this.loadSystemHealth();

    // Auto-refresh every 30 seconds if enabled
    interval(30000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => {
          if (this.autoRefresh) {
            return this.adminService.getSystemHealth();
          }
          return [];
        })
      )
      .subscribe({
        next: (data) => {
          this.systemHealth = data;
        }
      });

    this.loadActivityLogs();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSystemHealth() {
    this.loading = true;
    this.error = null;

    this.adminService.getSystemHealth()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.systemHealth = data;
          this.loading = false;

          // Load alerts after health
          this.loadSystemAlerts();
        },
        error: (err) => {
          this.error = 'Failed to load system health';
          console.error(err);
          this.loading = false;
        }
      });
  }

  loadActivityLogs() {
    this.adminService.getSystemLogs()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.activityLogs = response.data || [];
        },
        error: (err) => {
          console.error('Failed to load activity logs', err);
        }
      });
  }

  loadSystemAlerts() {
    // This endpoint might need to be added to the admin service
    // For now, we'll use placeholder data or create a mock
    this.systemAlerts = [
      {
        id: 1,
        level: 'warning',
        message: 'High memory usage detected',
        timestamp: new Date().toISOString(),
        resolved: false
      },
      {
        id: 2,
        level: 'info',
        message: 'Database backup completed successfully',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        resolved: true
      }
    ];
  }

  refresh() {
    this.loadSystemHealth();
    this.loadActivityLogs();
  }

  toggleAutoRefresh() {
    this.autoRefresh = !this.autoRefresh;
  }

  getHealthStatusColor(): string {
    if (!this.systemHealth) return 'medium';
    return this.systemHealth.status === 'healthy' ? 'success' : 'danger';
  }

  getComponentStatusColor(status: string): string {
    return status === 'operational' ? 'success' : 'danger';
  }

  getMemoryUsageColor(usage: number): string {
    if (usage > 80) return 'danger';
    if (usage > 60) return 'warning';
    return 'success';
  }

  getCpuUsageColor(usage: number): string {
    if (usage > 80) return 'danger';
    if (usage > 60) return 'warning';
    return 'success';
  }

  getDiskUsageColor(usage: number): string {
    if (usage > 85) return 'danger';
    if (usage > 70) return 'warning';
    return 'success';
  }

  getAlertBadgeColor(level: string): string {
    const colors: { [key: string]: string } = {
      'critical': 'danger',
      'warning': 'warning',
      'info': 'primary'
    };
    return colors[level] || 'medium';
  }

  getLogStatusBadgeColor(status: string): string {
    const colors: { [key: string]: string } = {
      'success': 'success',
      'error': 'danger',
      'warning': 'warning',
      'info': 'primary'
    };
    return colors[status] || 'medium';
  }

  getUptimeDisplay(): string {
    if (!this.systemHealth) return '-';
    const hours = Math.floor(this.systemHealth.uptime / 3600);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h`;
    return `${hours}h`;
  }
}
