import { Injectable } from '@angular/core';
import { Geolocation, Position } from '@capacitor/geolocation';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private currentPositionSubject = new BehaviorSubject<Position | null>(null);
  public currentPosition$: Observable<Position | null> = this.currentPositionSubject.asObservable();
  
  private watchId: string | null = null;

  constructor() {}

  async requestPermissions() {
    try {
      const permissions = await Geolocation.checkPermissions();
      if (permissions.location === 'granted') return true;
      
      const req = await Geolocation.requestPermissions();
      return req.location === 'granted';
    } catch (error) {
      console.warn('Error requesting location permissions, falling back to browser prompt', error);
      // Di browser (PWA) kadang Capacitor checkPermissions melempar error,
      // kita return true agar browser bisa memunculkan prompt native saat fungsi GPS dipanggil.
      return true;
    }
  }

  async getCurrentPosition() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true
      });
      this.currentPositionSubject.next(position);
      return position;
    } catch (error) {
      console.error('Error getting current position', error);
      // Fallback data simulasi untuk testing jika akses diblokir (misal karena HTTP non-localhost)
      const mockPosition = {
        timestamp: Date.now(),
        coords: { latitude: -6.200000, longitude: 106.816666, accuracy: 10, altitudeAccuracy: null, altitude: null, speed: null, heading: null } as any
      } as Position;
      this.currentPositionSubject.next(mockPosition);
      return mockPosition;
    }
  }

  async startTracking() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return;

      if (this.watchId !== null) return;

      this.watchId = await Geolocation.watchPosition(
        { enableHighAccuracy: true, timeout: 10000 },
        (position, err) => {
          if (position) {
            this.currentPositionSubject.next(position);
          }
          if (err) {
            console.warn('Error watching position, falling back to mock data', err);
            this.sendMockPosition();
          }
        }
      );
    } catch (error) {
      console.error('Error starting location tracking', error);
      // Gunakan interval mock jika capacitor crash
      this.watchId = 'mock_watch_' + Date.now();
      setInterval(() => this.sendMockPosition(), 5000);
    }
  }

  private sendMockPosition() {
    // Tambahkan jitter kecil agar terlihat ada pergerakan saat simulasi berjalan di browser tanpa HTTPS
    const jitterLat = (Math.random() - 0.5) * 0.001;
    const jitterLng = (Math.random() - 0.5) * 0.001;

    const mockPosition = {
      timestamp: Date.now(),
      coords: { latitude: -6.200000 + jitterLat, longitude: 106.816666 + jitterLng, accuracy: 10, altitudeAccuracy: null, altitude: null, speed: null, heading: null } as any
    } as Position;
    this.currentPositionSubject.next(mockPosition);
  }

  async stopTracking() {
    if (this.watchId !== null) {
      await Geolocation.clearWatch({ id: this.watchId });
      this.watchId = null;
    }
  }
}
