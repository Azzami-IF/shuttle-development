import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    const allowedRoles = route.data['roles'] as string[] | undefined;
    const redirectTo = route.data['redirectTo'] as string | undefined;
    const role = this.auth.getRole() || JSON.parse(localStorage.getItem('user') || '{}')?.role;

    if (allowedRoles && role && !allowedRoles.includes(role)) {
      const fallback = role === 'admin' ? '/admin/dashboard' : '/dashboard';
      this.router.navigate([redirectTo || fallback], {
        replaceUrl: true,
      });
      return false;
    }

    if (allowedRoles && !role) {
      this.router.navigate(['/login'], { replaceUrl: true });
      return false;
    }

    return true;
  }
}
