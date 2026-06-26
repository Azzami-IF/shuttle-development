import { Component, OnInit, OnDestroy, AfterViewInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { UiService } from '../../services/ui.service';
import { LanguageService } from '../../services/language.service';
import { LocationService } from '../../services/location.service';
import { EchoService } from '../../services/echo.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

declare var mapboxgl: any;

@Component({
  standalone: false,
  selector: 'app-driver-tracking',
  templateUrl: './driver-tracking.page.html',
  styleUrls: ['./driver-tracking.page.scss'],
})
export class DriverTrackingPage implements OnInit, OnDestroy, AfterViewInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private router = inject(Router);
  private ui = inject(UiService);
  langService = inject(LanguageService);
  locationService = inject(LocationService);
  private echo = inject(EchoService);

  tripId: any;
  trip: any;
  passengers: any[] = [];
  gpsStatus: string = 'Menunggu...';
  lastUpdateTime: string = '';
  metrics = {
    fuel: 88,
    temp: 'Normal'
  };
  shiftTimer: string = '03:24:15';
  passengerCount = 0;

  currentLat: number | null = null;
  currentLng: number | null = null;
  stopMarkers: any[] = [];

  coordinatesMap: { [key: string]: [number, number] } = {
    'jakarta': [-6.3090, 106.8824],
    'terminal kampung rambutan': [-6.3090, 106.8824],
    'bandung': [-6.9452, 107.5937],
    'terminal leuwi panjang': [-6.9452, 107.5937],
    'karawang': [-6.3073, 107.2913],
    'sumedang': [-6.8524, 107.9234],
    'subang': [-6.5715, 107.7587],
    'purwakarta': [-6.5571, 107.4431],
    'cikampek': [-6.4025, 107.4589],
    'cirebon': [-6.7320, 108.5523],
    'bogor': [-6.5971, 106.7932],
    'depok': [-6.4025, 106.8227],
    'bekasi': [-6.2383, 106.9756],
    'tangerang': [-6.1702, 106.6403]
  };

  routeStops: { [key: string]: { name: string, coords: [number, number] }[] } = {
    'depok-bandung': [
      { name: 'Pool Karawang', coords: [107.2913, -6.3073] },
      { name: 'Pool Purwakarta', coords: [107.4431, -6.5571] }
    ],
    'bogor-bandung': [
      { name: 'Pool Cianjur', coords: [107.1396, -6.8242] },
      { name: 'Pool Padalarang', coords: [107.4721, -6.8406] }
    ],
    'jakarta-bandung': [
      { name: 'Pool Bekasi', coords: [106.9756, -6.2383] },
      { name: 'Pool Karawang', coords: [107.2913, -6.3073] }
    ]
  };

  getStops() {
    if (!this.trip?.schedule) return [];
    const origin = this.trip.schedule.origin.toLowerCase().trim();
    const destination = this.trip.schedule.destination.toLowerCase().trim();
    const key = `${origin}-${destination}`;
    return this.routeStops[key] || [];
  }

  getDestinationCoords(destName: string): [number, number] | null {
    const name = destName.toLowerCase().trim();
    return this.coordinatesMap[name] || null;
  }

  map: any = null;
  marker: any = null;
  locationSub: Subscription | null = null;
  locationPollingInterval: any = null;

  constructor() {}

  getTranslation(key: string): string {
    return this.langService.get(key);
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.tripId = params['id'];
      if (this.tripId) {
        this.loadTrip();
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initMap();
    }, 500);
  }

  ngOnDestroy() {
    this.stopLocationUpdates();
    this.stopLocationPolling();
    if (this.map) {
      this.map.remove();
    }
    if (this.trip && this.trip.schedule_id) {
      this.echo.getEcho().leave(`schedules.${this.trip.schedule_id}`);
    }
  }

  fetchLatestLocationOnce() {
    this.api.get(`trips/${this.tripId}/latest-location`).subscribe({
      next: (res: any) => {
        if (res && res.latitude && res.longitude) {
          this.currentLat = res.latitude;
          this.currentLng = res.longitude;
          
          if (this.map && this.marker) {
            this.marker.setLngLat([res.longitude, res.latitude]);
            
            // Auto-center camera if outside current viewport to avoid camera shaking
            const bounds = this.map.getBounds();
            if (!bounds.contains([res.longitude, res.latitude])) {
              this.map.panTo([res.longitude, res.latitude]);
            }
          }
        }
      },
      error: (err) => console.error('Error fetching initial location in driver', err)
    });
  }

  startLocationPolling() {
    if (this.locationPollingInterval) clearInterval(this.locationPollingInterval);
    this.locationPollingInterval = setInterval(() => {
      this.fetchLatestLocationOnce();
    }, 5000);
  }

  stopLocationPolling() {
    if (this.locationPollingInterval) {
      clearInterval(this.locationPollingInterval);
      this.locationPollingInterval = null;
    }
  }

  initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    mapboxgl.accessToken = environment.mapboxToken;

    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v11', // Light theme
      center: [106.816666, -6.200000], // Default to Jakarta [lng, lat]
      zoom: 13
    });

    this.map.addControl(new mapboxgl.NavigationControl());

    this.map.on('load', () => {
      // Create the custom bus marker
      const elBus = document.createElement('div');
      elBus.className = 'custom-div-icon';
      elBus.innerHTML = `<div style="background-color:#18281e; color:white; padding:8px; border-radius:50%; border:2px solid white; box-shadow:0 0 10px rgba(0,0,0,0.5); text-align:center;">
                            <span class="material-symbols-outlined" style="font-size:20px; display:block;">directions_bus</span>
                          </div>`;
      this.marker = new mapboxgl.Marker({ element: elBus })
        .setLngLat([106.816666, -6.200000])
        .addTo(this.map);

      // Fetch the initial location immediately on load to place the marker correctly
      this.fetchLatestLocationOnce();

      if (this.trip && this.trip.schedule) {
        this.plotTerminalsOnMap();
      }
    });
  }

  loadTrip() {
    this.api.get(`trips/${this.tripId}`).subscribe((res: any) => {
      this.trip = res;
      if (res && res.status === 'on-going') {
        this.startLocationUpdates();
        this.startLocationPolling();
      } else {
        this.stopLocationUpdates();
        this.stopLocationPolling();
      }
      
      if (this.trip && this.trip.schedule_id) {
        this.loadPassengers();
        this.subscribeToRealTimeUpdates();
      }
      
      if (this.trip && this.trip.schedule) {
        this.plotTerminalsOnMap();
      }
    });
  }

  subscribeToRealTimeUpdates() {
    if (!this.trip?.schedule_id) return;
    const scheduleId = this.trip.schedule_id;

    this.echo.getEcho()
      .private(`schedules.${scheduleId}`)
      .listen('.App\\Events\\DriverLocationUpdated', (e: any) => {
        console.log('Real-time location updated (simulation):', e);
        if (e && e.latitude && e.longitude) {
          this.currentLat = e.latitude;
          this.currentLng = e.longitude;
          
          if (this.map && this.marker) {
            this.marker.setLngLat([e.longitude, e.latitude]);
            
            // Auto-center camera only if the marker goes out of the current viewport to avoid camera shaking
            const bounds = this.map.getBounds();
            if (!bounds.contains([e.longitude, e.latitude])) {
              this.map.panTo([e.longitude, e.latitude]);
            }
          }
        }
      });
  }

  originMarker: any = null;
  destMarker: any = null;

  async plotTerminalsOnMap() {
    if (!this.map || !this.trip?.schedule) return;

    const schedule = this.trip.schedule;

    // Resolve origin coordinates with fallback
    let originCoords: [number, number] = [106.8227, -6.4025];
    if (schedule.pickup_lng && schedule.pickup_lat) {
      originCoords = [parseFloat(schedule.pickup_lng), parseFloat(schedule.pickup_lat)];
    } else {
      const mapped = this.getDestinationCoords(schedule.origin);
      if (mapped) {
        originCoords = [mapped[1], mapped[0]]; // Swap to [lng, lat]
      }
    }

    // Resolve destination coordinates with fallback
    let destCoords: [number, number] = [107.5937, -6.9452];
    if (schedule.drop_off_lng && schedule.drop_off_lat) {
      destCoords = [parseFloat(schedule.drop_off_lng), parseFloat(schedule.drop_off_lat)];
    } else {
      const mapped = this.getDestinationCoords(schedule.destination);
      if (mapped) {
        destCoords = [mapped[1], mapped[0]]; // Swap to [lng, lat]
      }
    }

    // Add Origin Marker
    if (this.originMarker) this.originMarker.remove();
    const elOrigin = document.createElement('div');
    elOrigin.className = 'route-marker-icon origin';
    elOrigin.innerHTML = `<div style="background-color:#536349; color:white; padding:6px 10px; border-radius:12px; font-weight:bold; font-size:11px; border:1px solid white; white-space:nowrap; box-shadow:0 2px 5px rgba(0,0,0,0.3);">
                            Asal: ${schedule.pickup_name || schedule.origin}
                          </div>`;
    this.originMarker = new mapboxgl.Marker({ element: elOrigin })
      .setLngLat(originCoords)
      .addTo(this.map);

    // Add Destination Marker
    if (this.destMarker) this.destMarker.remove();
    const elDest = document.createElement('div');
    elDest.className = 'route-marker-icon destination';
    elDest.innerHTML = `<div style="background-color:#d9534f; color:white; padding:6px 10px; border-radius:12px; font-weight:bold; font-size:11px; border:1px solid white; white-space:nowrap; box-shadow:0 2px 5px rgba(0,0,0,0.3);">
                            Tujuan: ${schedule.drop_off_name || schedule.destination}
                          </div>`;
    this.destMarker = new mapboxgl.Marker({ element: elDest })
      .setLngLat(destCoords)
      .addTo(this.map);

    // Add Intermediate Stops on Map
    this.stopMarkers.forEach(m => m.remove());
    this.stopMarkers = [];
    const stops = this.getStops();
    stops.forEach((stop) => {
      const elStop = document.createElement('div');
      elStop.className = 'route-marker-icon stop';
      elStop.innerHTML = `<div style="background-color:#f59e0b; color:white; padding:4px 8px; border-radius:10px; font-weight:bold; font-size:9px; border:1px solid white; white-space:nowrap; box-shadow:0 2px 4px rgba(0,0,0,0.2);">
                              Singgah: ${stop.name}
                            </div>`;
      const stopMarker = new mapboxgl.Marker({ element: elStop })
        .setLngLat(stop.coords)
        .addTo(this.map);
      this.stopMarkers.push(stopMarker);
    });

    // Construct waypoint string for routing
    let waypointStr = `${originCoords[0]},${originCoords[1]}`;
    stops.forEach(stop => {
      waypointStr += `;${stop.coords[0]},${stop.coords[1]}`;
    });
    waypointStr += `;${destCoords[0]},${destCoords[1]}`;

    // Draw planned route using Mapbox Directions API
    const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${waypointStr}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

    fetch(directionsUrl)
      .then(res => res.json())
      .then(data => {
        if (data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates;

          if (this.map.getSource('route-source')) {
            this.map.getSource('route-source').setData({
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: coords
              }
            });
          } else {
            this.map.addSource('route-source', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: coords
                }
              }
            });

            this.map.addLayer({
              id: 'route-layer',
              type: 'line',
              source: 'route-source',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#1a73e8', // Solid Google Maps blue
                'line-width': 5,
                'line-opacity': 0.8
              }
            });
          }

          // Fit bounds
          const bounds = new mapboxgl.LngLatBounds();
          bounds.extend(originCoords);
          bounds.extend(destCoords);
          if (this.marker) {
            bounds.extend(this.marker.getLngLat());
          }
          this.map.fitBounds(bounds, { padding: 50 });
        }
      })
      .catch(err => {
        console.error('Error drawing route via Mapbox Directions API:', err);
      });
  }

  async startLocationUpdates() {
    const hasPermission = await this.locationService.requestPermissions();
    if (!hasPermission) {
      this.gpsStatus = 'Izin lokasi ditolak';
      this.ui.showToast('Gagal memulai GPS. Izin lokasi ditolak.', 'danger');
      return;
    }

    this.gpsStatus = 'Aktif';
    await this.locationService.startTracking();

    if (!this.locationSub) {
      this.locationSub = this.locationService.currentPosition$.subscribe(position => {
        if (position) {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          this.currentLat = lat;
          this.currentLng = lng;
          
          // Update Map
          if (this.map && this.marker) {
            this.marker.setLngLat([lng, lat]);
            this.map.setCenter([lng, lat]);
          }

          // Sync to Server
          this.syncLocationToServer(lat, lng);
        }
      });
    }
  }

  async stopLocationUpdates() {
    await this.locationService.stopTracking();
    if (this.locationSub) {
      this.locationSub.unsubscribe();
      this.locationSub = null;
    }
    this.gpsStatus = 'Tidak aktif';
  }

  syncLocationToServer(lat: number, lng: number) {
    if (!this.trip) return;
    this.api.post(`trips/${this.tripId}/location`, {
      latitude: lat,
      longitude: lng
    }).subscribe({
      next: () => {
        this.lastUpdateTime = new Date().toLocaleTimeString('id-ID');
      },
      error: (err) => console.error('Location sync failed', err)
    });
  }

  updateLocation() {
    this.locationService.getCurrentPosition().then(pos => {
      if (pos) {
        this.ui.showToast('Lokasi berhasil diperbarui secara manual', 'success');
      } else {
        this.ui.showToast('Gagal mengambil lokasi saat ini', 'warning');
      }
    });
  }

  loadPassengers() {
    if (!this.trip?.schedule_id) return;
    this.api.get(`bookings?schedule_id=${this.trip.schedule_id}`).subscribe((res: any[]) => {
      this.passengers = res || [];
      this.passengerCount = this.passengers.length;
    });
  }

  startTrip() {
    this.api.post(`trips/${this.tripId}/start`, {}).subscribe({
      next: () => {
        this.ui.showToast('Perjalanan berhasil dimulai!', 'success');
        this.loadTrip();
      },
      error: (err) => {
        const msg = err.error?.message || 'Gagal memulai perjalanan.';
        // Tampilkan pesan alasan kenapa ditolak (misal tidak ada penumpang)
        this.ui.showToast(msg, 'danger');
        if (msg.includes('tidak ada penumpang')) {
          this.loadTrip(); // Refresh agar UI berubah jadi dibatalkan
        }
      }
    });
  }

  updateStatus(status: string) {
    const endpoint = status === 'completed' ? 'complete' : 'status';
    const payload = status === 'completed' ? {} : { status };

    this.api.post(`trips/${this.tripId}/${endpoint}`, payload).subscribe({
      next: () => {
        this.ui.showToast(`Status perjalanan diperbarui ke ${status}`, 'success');
        if (status === 'completed') {
          this.stopLocationUpdates();
        }
        this.loadTrip();
      },
      error: (err) => {
        const msg = err.error?.message || 'Gagal memperbarui status perjalanan';
        this.ui.showToast(msg, 'danger');
      }
    });
  }

  isStatus(status: string) {
    return this.trip?.status === status;
  }

  getSeatLabel(seat: any): string {
    if (!seat || !seat.seat_number) return '-';
    const index = parseInt(seat.seat_number, 10) - 1;
    if (isNaN(index)) return seat.seat_number;
    const rowNum = Math.floor(index / 4) + 1;
    const colIndex = index % 4;
    const letters = ['A', 'B', 'C', 'D'];
    return `${rowNum}${letters[colIndex]}`;
  }

  getStopStatus(lng: any, lat: any, type: string = 'stop'): string {
    const stopLat = parseFloat(lat);
    const stopLng = parseFloat(lng);

    if (!this.currentLat || !this.currentLng) {
      if (type === 'origin' && this.trip?.status !== 'scheduled') {
        return 'passed';
      }
      return 'pending';
    }

    const dist = this.getDistanceFromLatLonInKm(this.currentLat, this.currentLng, stopLat, stopLng);
    if (dist < 1.0) {
      return 'arrived';
    }

    if (type === 'origin') {
      return 'passed';
    }
    
    if (type === 'destination') {
      return 'pending';
    }

    const destName = this.trip?.schedule?.destination;
    if (destName) {
      const destCoords = this.getDestinationCoords(destName);
      if (destCoords) {
        const distCurrentToDest = this.getDistanceFromLatLonInKm(this.currentLat, this.currentLng, destCoords[0], destCoords[1]);
        const distStopToDest = this.getDistanceFromLatLonInKm(stopLat, stopLng, destCoords[0], destCoords[1]);
        if (distCurrentToDest < distStopToDest - 1.0) {
          return 'passed';
        }
      }
    }
    return 'pending';
  }

  getStopStatusLabel(lng: any, lat: any): string {
    const status = this.getStopStatus(lng, lat);
    if (status === 'arrived') return 'Mendekati / Berhenti';
    if (status === 'passed') return 'Sudah Dilewati';
    return 'Belum Sampai';
  }

  getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = this.deg2rad(lat2-lat1);  
    const dLon = this.deg2rad(lon2-lon1); 
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; 
  }

  deg2rad(deg: number) {
    return deg * (Math.PI/180);
  }
}
