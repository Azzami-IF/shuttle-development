import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule),
    canActivate: [AuthGuard],
    data: {
      roles: ['customer', 'admin'],
      redirectTo: '/onboarding'
    }
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./pages/forgot-password/forgot-password.module').then( m => m.ForgotPasswordPageModule)
  },
  {
    path: 'reset-password',
    loadChildren: () => import('./pages/reset-password/reset-password.module').then( m => m.ResetPasswordPageModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then( m => m.DashboardPageModule),
    canActivate: [AuthGuard],
    data: {
      roles: ['customer'],
      redirectTo: '/onboarding'
    }
  },
  {
    path: 'schedule-list',
    loadChildren: () => import('./pages/schedule-list/schedule-list.module').then( m => m.ScheduleListPageModule),
    canActivate: [AuthGuard],
    data: {
      roles: ['customer'],
      redirectTo: '/onboarding'
    }
  },
  {
    path: 'seat-selection',
    loadChildren: () => import('./pages/seat-selection/seat-selection.module').then( m => m.SeatSelectionPageModule),
    canActivate: [AuthGuard],
    data: {
      roles: ['customer'],
      redirectTo: '/onboarding'
    }
  },
  {
    path: 'trip-tracking',
    loadChildren: () => import('./pages/trip-tracking/trip-tracking.module').then( m => m.TripTrackingPageModule),
    canActivate: [AuthGuard],
    data: {
      roles: ['customer'],
      redirectTo: '/onboarding'
    }
  },
  {
    path: 'booking-detail',
    loadChildren: () => import('./pages/booking-detail/booking-detail.module').then( m => m.BookingDetailPageModule),
    canActivate: [AuthGuard],
    data: {
      roles: ['customer'],
      redirectTo: '/onboarding'
    }
  },
  {
    path: 'onboarding',
    loadChildren: () => import('./pages/onboarding/onboarding.module').then( m => m.OnboardingPageModule)
  },
  {
    path: 'payment',
    loadChildren: () => import('./pages/payment/payment.module').then( m => m.PaymentPageModule),
    canActivate: [AuthGuard],
    data: {
      roles: ['customer'],
      redirectTo: '/onboarding'
    }
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile.module').then( m => m.ProfilePageModule),
    canActivate: [AuthGuard],
    data: {
      roles: ['customer', 'admin'],
      redirectTo: '/onboarding'
    }
  },
  {
    path: 'admin/dashboard',
    loadChildren: () => import('./pages/admin-dashboard/admin-dashboard.module').then( m => m.AdminDashboardPageModule),
    canActivate: [AuthGuard],
    data: {
      roles: ['admin'],
      redirectTo: '/login'
    }
  },
  {
    path: 'admin/admin-users',
    loadChildren: () => import('./pages/admin-users/admin-users.module').then( m => m.AdminUsersPageModule),
    canActivate: [AuthGuard],
    data: {
      roles: ['admin'],
      redirectTo: '/login'
    }
  },
  {
    path: 'admin/admin-drivers',
    loadChildren: () => import('./pages/admin-drivers/admin-drivers.module').then( m => m.AdminDriversPageModule),
    canActivate: [AuthGuard],
    data: {
      roles: ['admin'],
      redirectTo: '/login'
    }
  },
  {
    path: 'admin/admin-vehicles',
    loadChildren: () => import('./pages/admin-vehicles/admin-vehicles.module').then( m => m.AdminVehiclesPageModule),
    canActivate: [AuthGuard],
    data: {
      roles: ['admin'],
      redirectTo: '/login'
    }
  },
  {
    path: 'admin/admin-schedules',
    loadChildren: () => import('./pages/admin-schedules/admin-schedules.module').then( m => m.AdminSchedulesPageModule),
    canActivate: [AuthGuard],
    data: {
      roles: ['admin'],
      redirectTo: '/login'
    }
  },
  {
    path: 'admin/admin-bookings',
    loadChildren: () => import('./pages/admin-bookings/admin-bookings.module').then( m => m.AdminBookingsPageModule),
    canActivate: [AuthGuard],
    data: {
      roles: ['admin'],
      redirectTo: '/login'
    }
  },
  {
    path: 'admin/admin-reports',
    loadChildren: () => import('./pages/admin-reports/admin-reports.module').then( m => m.AdminReportsPageModule),
    canActivate: [AuthGuard],
    data: {
      roles: ['admin'],
      redirectTo: '/login'
    }
  },
  {
    path: 'admin/admin-system',
    loadChildren: () => import('./pages/admin-system/admin-system.module').then( m => m.AdminSystemPageModule),
    canActivate: [AuthGuard],
    data: {
      roles: ['admin'],
      redirectTo: '/login'
    }
  },
  {
    path: '',
    redirectTo: 'onboarding',
    pathMatch: 'full'
  },  {
    path: 'privacy-policy',
    loadChildren: () => import('./pages/privacy-policy/privacy-policy.module').then( m => m.PrivacyPolicyPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, useHash: true })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
