import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = inject(ApiService);

  private userSubject = new BehaviorSubject<any>(null);
  public user$ = this.userSubject.asObservable();

  constructor() {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.userSubject.next(JSON.parse(savedUser));
    }
  }

  login(credentials: any) {
    return this.api.postForm('login', {
      email: String(credentials.email ?? '').trim(),
      password: String(credentials.password ?? ''),
    }).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.userSubject.next(res.user);
      })
    );
  }

  register(userData: any) {
    return this.api.postForm('register', {
      name: String(userData.name ?? '').trim(),
      email: String(userData.email ?? '').trim(),
      password: String(userData.password ?? ''),
      role: String(userData.role ?? 'customer'),
      phone: String(userData.phone ?? ''),
    }).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.userSubject.next(res.user);
      })
    );
  }

  logout() {
    return this.api.post('logout', {}).pipe(
      tap(() => {
        this.logoutDirect();
      })
    );
  }

  logoutDirect() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  getRole() {
    const user = this.userSubject.value;
    return user ? user.role : null;
  }

  getHomeRoute() {
    const role = this.getRole() || JSON.parse(localStorage.getItem('user') || '{}')?.role;
    if (role === 'admin') return '/admin/dashboard';
    return '/dashboard';
  }

  updateProfile(data: any) {
    return this.api.post('profile/update', data).pipe(
      tap((res: any) => {
        localStorage.setItem('user', JSON.stringify(res.user));
        this.userSubject.next(res.user);
      })
    );
  }

  changePassword(data: any) {
    return this.api.post('profile/password', data);
  }

  forgotPassword(email: string) {
    return this.api.post('password/forgot', { email });
  }

  resetPassword(data: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) {
    return this.api.post('password/reset', data);
  }
}
