import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private api = inject(ApiService);

  constructor() {}

  // ============================================
  // DASHBOARD ANALYTICS
  // ============================================

  /**
   * Get overall dashboard statistics
   */
  getDashboardStats(): Observable<any> {
    return this.api.get('admin/dashboard/stats');
  }

  /**
   * Get booking analytics
   */
  getDashboardBookings(days: number = 7): Observable<any> {
    return this.api.get('admin/dashboard/bookings', { days });
  }

  /**
   * Get revenue reports
   */
  getDashboardRevenue(days: number = 30): Observable<any> {
    return this.api.get('admin/dashboard/revenue', { days });
  }

  /**
   * Get driver statistics
   */
  getDashboardDrivers(): Observable<any> {
    return this.api.get('admin/dashboard/drivers');
  }

  /**
   * Get vehicle statistics
   */
  getDashboardVehicles(): Observable<any> {
    return this.api.get('admin/dashboard/vehicles');
  }

  // ============================================
  // USER MANAGEMENT
  // ============================================

  /**
   * Get all users with optional filtering and pagination
   */
  getUsers(role?: string, search?: string, perPage: number = 20, page: number = 1): Observable<any> {
    const params: any = { per_page: perPage, page };
    if (role) params.role = role;
    if (search) params.search = search;
    return this.api.get('admin/users', params);
  }

  /**
   * Get single user details
   */
  getUser(userId: number): Observable<any> {
    return this.api.get(`admin/users/${userId}`);
  }

  /**
   * Create new user
   */
  createUser(userData: any): Observable<any> {
    return this.api.post('admin/users', userData);
  }

  /**
   * Update user
   */
  updateUser(userId: number, userData: any): Observable<any> {
    return this.api.put(`admin/users/${userId}`, userData);
  }

  /**
   * Delete user
   */
  deleteUser(userId: number): Observable<any> {
    return this.api.delete(`admin/users/${userId}`);
  }

  // ============================================
  // DRIVER MANAGEMENT
  // ============================================

  /**
   * Get all drivers
   */
  getDrivers(perPage: number = 20, page: number = 1): Observable<any> {
    return this.api.get('admin/drivers', { per_page: perPage, page });
  }

  /**
   * Approve driver
   */
  approveDriver(driverId: number): Observable<any> {
    return this.api.put(`admin/drivers/${driverId}/approve`, {});
  }

  // ============================================
  // VEHICLE MANAGEMENT
  // ============================================

  /**
   * Get all vehicles
   */
  getVehicles(search?: string, perPage: number = 20, page: number = 1): Observable<any> {
    const params: any = { per_page: perPage, page };
    if (search) params.search = search;
    return this.api.get('admin/vehicles', params);
  }

  /**
   * Create vehicle
   */
  createVehicle(vehicleData: any): Observable<any> {
    return this.api.post('admin/vehicles', vehicleData);
  }

  /**
   * Update vehicle
   */
  updateVehicle(vehicleId: number, vehicleData: any): Observable<any> {
    return this.api.put(`admin/vehicles/${vehicleId}`, vehicleData);
  }

  /**
   * Delete vehicle
   */
  deleteVehicle(vehicleId: number): Observable<any> {
    return this.api.delete(`admin/vehicles/${vehicleId}`);
  }

  // ============================================
  // SCHEDULE MANAGEMENT
  // ============================================

  /**
   * Get all schedules
   */
  getSchedules(search?: string, perPage: number = 20, page: number = 1): Observable<any> {
    const params: any = { per_page: perPage, page };
    if (search) params.search = search;
    return this.api.get('admin/schedules', params);
  }

  /**
   * Create schedule
   */
  createSchedule(scheduleData: any): Observable<any> {
    return this.api.post('admin/schedules', scheduleData);
  }

  /**
   * Delete schedule
   */
  deleteSchedule(scheduleId: number): Observable<any> {
    return this.api.delete(`admin/schedules/${scheduleId}`);
  }

  // ============================================
  // BOOKING MANAGEMENT
  // ============================================

  /**
   * Get all bookings with filtering
   */
  getBookings(status?: string, search?: string, perPage: number = 20, page: number = 1): Observable<any> {
    const params: any = { per_page: perPage, page };
    if (status) params.status = status;
    if (search) params.search = search;
    return this.api.get('admin/bookings', params);
  }

  /**
   * Get single booking
   */
  getBooking(bookingId: number): Observable<any> {
    return this.api.get(`admin/bookings/${bookingId}`);
  }

  /**
   * Approve booking (manual payment confirmation)
   */
  approveBooking(bookingId: number): Observable<any> {
    return this.api.post(`admin/bookings/${bookingId}/approve`, {});
  }

  /**
   * Cancel booking
   */
  cancelBooking(bookingId: number): Observable<any> {
    return this.api.post(`admin/bookings/${bookingId}/cancel`, {});
  }

  // ============================================
  // TRIP MANAGEMENT
  // ============================================

  /**
   * Get all trips
   */
  getTrips(status?: string, perPage: number = 20, page: number = 1): Observable<any> {
    const params: any = { per_page: perPage, page };
    if (status) params.status = status;
    return this.api.get('admin/trips', params);
  }

  /**
   * Get single trip
   */
  getTrip(tripId: number): Observable<any> {
    return this.api.get(`admin/trips/${tripId}`);
  }

  // ============================================
  // REPORTS & ANALYTICS
  // ============================================

  /**
   * Get daily report
   */
  getDailyReport(date?: string): Observable<any> {
    const params: any = {};
    if (date) params.date = date;
    return this.api.get('admin/reports/daily', params);
  }

  /**
   * Get monthly report
   */
  getMonthlyReport(month?: string): Observable<any> {
    const params: any = {};
    if (month) params.month = month;
    return this.api.get('admin/reports/monthly', params);
  }

  // ============================================
  // SYSTEM MONITORING
  // ============================================

  /**
   * Get system health status
   */
  getSystemHealth(): Observable<any> {
    return this.api.get('admin/system/health');
  }

  /**
   * Get system logs
   */
  getSystemLogs(): Observable<any> {
    return this.api.get('admin/system/logs');
  }
}
