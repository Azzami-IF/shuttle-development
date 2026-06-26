import { Injectable } from '@angular/core';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

@Injectable({ providedIn: 'root' })
export class NavService {
  private driverItems: NavItem[] = [
    { label: 'home', icon: 'home', route: '/driver-dashboard' },
    { label: 'schedule', icon: 'calendar_month', route: '/driver-trips' },
    { label: 'bookings', icon: 'history', route: '/driver-history' },
    { label: 'profile', icon: 'person', route: '/driver-profile' }
  ];

  private customerItems: NavItem[] = [
    { label: 'home', icon: 'home', route: '/dashboard' },
    { label: 'schedule', icon: 'calendar_month', route: '/schedule' },
    { label: 'bookings', icon: 'history', route: '/history' },
    { label: 'profile', icon: 'person', route: '/profile' }
  ];

  constructor() {}

  getItems(role?: string): NavItem[] {
    return role === 'driver' ? this.driverItems : this.customerItems;
  }
}
