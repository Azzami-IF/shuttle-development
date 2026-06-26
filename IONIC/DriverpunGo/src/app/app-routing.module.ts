import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'driver-trips',
    loadChildren: () => import('./pages/driver-trips/driver-trips.module').then( m => m.DriverTripsPageModule),
    canActivate: [AuthGuard],
    data: {
      roles: ['driver'],
      redirectTo: '/login'
    }
  },
  {
    path: 'onboarding',
    loadChildren: () => import('./pages/onboarding/onboarding.module').then( m => m.OnboardingPageModule)
  },
  {
    path: 'driver-history',
    loadChildren: () => import('./pages/driver-history/driver-history.module').then( m => m.DriverHistoryPageModule),
    canActivate: [AuthGuard],
    data: {
      roles: ['driver'],
      redirectTo: '/login'
    }
  },
  {
    path: 'driver-dashboard',
    loadChildren: () => import('./pages/driver-dashboard/driver-dashboard.module').then( m => m.DriverDashboardPageModule),
    canActivate: [AuthGuard],
    data: {
      roles: ['driver'],
      redirectTo: '/login'
    }
  },
  {
    path: 'driver-tracking',
    loadChildren: () => import('./pages/driver-tracking/driver-tracking.module').then( m => m.DriverTrackingPageModule),
    canActivate: [AuthGuard],
    data: {
      roles: ['driver'],
      redirectTo: '/login'
    }
  },
  {
    path: 'driver-status',
    redirectTo: 'driver-history',
    pathMatch: 'full'
  },
  {
    path: 'driver-vehicle',
    loadChildren: () => import('./pages/driver-vehicle/driver-vehicle.module').then( m => m.DriverVehiclePageModule),
    canActivate: [AuthGuard],
    data: {
      roles: ['driver'],
      redirectTo: '/login'
    }
  },
  {
    path: 'driver-profile',
    loadChildren: () => import('./pages/driver-profile/driver-profile.module').then( m => m.DriverProfilePageModule),
    canActivate: [AuthGuard],
    data: {
      roles: ['driver'],
      redirectTo: '/login'
    }
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'driver-account',
    loadChildren: () => import('./pages/driver-account/driver-account.module').then( m => m.DriverAccountPageModule)
  },
  {
    path: 'driver-help',
    loadChildren: () => import('./pages/driver-help/driver-help.module').then( m => m.DriverHelpPageModule)
  },
  {
    path: 'privacy-policy',
    loadChildren: () => import('./pages/privacy-policy/privacy-policy.module').then( m => m.PrivacyPolicyPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, useHash: true })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
