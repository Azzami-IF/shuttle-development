import { Component, OnDestroy, AfterViewInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';
import { Geolocation } from '@capacitor/geolocation';
import { environment } from '../../../environments/environment';
import { EchoService } from '../../services/echo.service';

declare var mapboxgl: any;

@Component({
  standalone: false,
  selector: 'app-trip-tracking',
  templateUrl: './trip-tracking.page.html',
  styleUrls: ['./trip-tracking.page.scss'],
})
export class TripTrackingPage implements OnDestroy, AfterViewInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private ui = inject(UiService);
  private router = inject(Router);
  private auth = inject(AuthService);
  private echo = inject(EchoService);

  tripId: any;
  trip: any;
  location: any;
  pollingInterval: any;
  statusPollingInterval: any;
  map: any;
  shuttleMarker: any;
  previousStatus: string = '';
  eta: number = 0;
  homeRoute = '/dashboard';
  userLocationWatchId: string | null = null;
  userMarker: any = null;
  originMarker: any = null;
  destMarker: any = null;
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
    'tangerang': [-6.1702, 106.6403],
    'malang': [-7.9839, 112.6214],
    'surabaya': [-7.2504, 112.7688],
    'semarang': [-6.9667, 110.4167]
  };

  demoRouteCoords: [number, number][] = [];

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

  constructor() {}

  isDemoSimulationActive: boolean = false;
  demoInterval: any;
  demoProgress: number = 0;

  ionViewWillEnter() {
    this.homeRoute = this.auth.getHomeRoute();
    this.tripId = this.route.snapshot.paramMap.get('id');
    this.loadTrip();
  }

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnDestroy() {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
    if (this.statusPollingInterval) clearInterval(this.statusPollingInterval);
    if (this.demoInterval) clearInterval(this.demoInterval);
    if (this.userLocationWatchId) {
      void Geolocation.clearWatch({ id: this.userLocationWatchId });
    }
    if (this.trip?.schedule_id) {
      this.echo.getEcho().leave(`schedules.${this.trip.schedule_id}`);
    }
    if (this.map) {
      this.map.remove();
    }
  }

  startDemoSimulation() {
    if (this.isDemoSimulationActive) {
      this.stopDemoSimulation();
      return;
    }

    this.isDemoSimulationActive = true;
    if (this.pollingInterval) clearInterval(this.pollingInterval);
    if (this.statusPollingInterval) clearInterval(this.statusPollingInterval);

    const originCoords: [number, number] = [
      this.trip?.schedule?.pickup_lng ? parseFloat(this.trip.schedule.pickup_lng) : 106.8227,
      this.trip?.schedule?.pickup_lat ? parseFloat(this.trip.schedule.pickup_lat) : -6.4025
    ];
    const destCoords: [number, number] = [
      this.trip?.schedule?.drop_off_lng ? parseFloat(this.trip.schedule.drop_off_lng) : 107.5937,
      this.trip?.schedule?.drop_off_lat ? parseFloat(this.trip.schedule.drop_off_lat) : -6.9452
    ];

    this.demoProgress = 0;
    void this.ui.showToast('Simulasi perjalanan dimulai (Lokal)', 'success');

    const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${originCoords[0]},${originCoords[1]};${destCoords[0]},${destCoords[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

    fetch(directionsUrl)
      .then(res => res.json())
      .then(data => {
        if (data.routes && data.routes.length > 0) {
          this.demoRouteCoords = data.routes[0].geometry.coordinates; // Mapbox is [lng, lat]
        } else {
          this.demoRouteCoords = [];
          for (let i = 0; i <= 100; i++) {
            const lng = originCoords[0] + (destCoords[0] - originCoords[0]) * (i / 100);
            const lat = originCoords[1] + (destCoords[1] - originCoords[1]) * (i / 100);
            this.demoRouteCoords.push([lng, lat]);
          }
        }
        this.runDemoInterval();
      })
      .catch(() => {
        this.demoRouteCoords = [];
        for (let i = 0; i <= 100; i++) {
          const lng = originCoords[0] + (destCoords[0] - originCoords[0]) * (i / 100);
          const lat = originCoords[1] + (destCoords[1] - originCoords[1]) * (i / 100);
          this.demoRouteCoords.push([lng, lat]);
        }
        this.runDemoInterval();
      });
  }

  runDemoInterval() {
    let step = 0;
    this.demoInterval = setInterval(() => {
      if (step >= this.demoRouteCoords.length) {
        clearInterval(this.demoInterval);
        this.isDemoSimulationActive = false;
        void this.ui.showToast('Simulasi selesai! Bus telah tiba di tujuan.', 'success');
        if (this.trip) {
          this.trip.status = 'completed';
        }
        return;
      }

      const currentPoint = this.demoRouteCoords[step];

      this.location = {
        latitude: currentPoint[1],
        longitude: currentPoint[0]
      };

      if (this.trip) {
        this.trip.status = 'on-going';
      }

      this.updateMarker(currentPoint[1], currentPoint[0]);
      step += 1;
    }, 150); // Move coordinate-by-coordinate every 150ms for a smooth gliding effect
  }

  stopDemoSimulation() {
    this.isDemoSimulationActive = false;
    if (this.demoInterval) clearInterval(this.demoInterval);
    void this.ui.showToast('Simulasi dihentikan. Menghubungkan ke GPS asli...', 'info');
    this.fetchLatestLocationOnce();
    this.subscribeToRealTimeUpdates();
    this.startStatusPolling();
  }

  initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    mapboxgl.accessToken = environment.mapboxToken;

    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v11', // Light theme
      center: [106.8227, -6.4025], // Default center Depok
      zoom: 12,
      pitch: 45, // 3D tilt for a premium, immersive look
      bearing: -10
    });

    this.map.addControl(new mapboxgl.NavigationControl());

    this.map.on('load', () => {
      this.drawRoute();
      this.fetchLatestLocationOnce();
      this.startStatusPolling();
      void this.startUserLocationTracking();
    });
  }

  loadTrip() {
    this.api.get(`trips/${this.tripId}`).subscribe({
      next: (res) => {
        this.trip = res;
        this.previousStatus = res.status;
        this.drawRoute();
        this.subscribeToRealTimeUpdates();
      },
      error: (err) => {
        console.error('Error loading trip', err);
        this.ui.showToast('Perjalanan tidak ditemukan atau tidak dapat diakses', 'danger');
        this.router.navigate([this.homeRoute], { replaceUrl: true });
      }
    });
  }

  drawRoute() {
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

    // Clear previous markers
    if (this.originMarker) this.originMarker.remove();
    if (this.destMarker) this.destMarker.remove();
    this.stopMarkers.forEach(m => m.remove());
    this.stopMarkers = [];

    // Add Origin Marker
    const elOrigin = document.createElement('div');
    elOrigin.className = 'route-marker-icon origin';
    elOrigin.innerHTML = `<div style="background-color:#536349; color:white; padding:6px 10px; border-radius:12px; font-weight:bold; font-size:11px; border:1px solid white; white-space:nowrap; box-shadow:0 2px 5px rgba(0,0,0,0.3);">
                            Asal: ${schedule.pickup_name || schedule.origin}
                          </div>`;
    this.originMarker = new mapboxgl.Marker({ element: elOrigin })
      .setLngLat(originCoords)
      .addTo(this.map);

    // Add Destination Marker
    const elDest = document.createElement('div');
    elDest.className = 'route-marker-icon destination';
    elDest.innerHTML = `<div style="background-color:#d9534f; color:white; padding:6px 10px; border-radius:12px; font-weight:bold; font-size:11px; border:1px solid white; white-space:nowrap; box-shadow:0 2px 5px rgba(0,0,0,0.3);">
                            Tujuan: ${schedule.drop_off_name || schedule.destination}
                          </div>`;
    this.destMarker = new mapboxgl.Marker({ element: elDest })
      .setLngLat(destCoords)
      .addTo(this.map);

    // Add Intermediate Stops on Map
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
          const coords = data.routes[0].geometry.coordinates; // Mapbox is [lng, lat]
          
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
          coords.forEach((coord: [number, number]) => bounds.extend(coord));
          this.map.fitBounds(bounds, { padding: 50 });
        }
      })
      .catch(err => {
        console.error('Error drawing route via Mapbox Directions API:', err);
      });
  }

  fetchLatestLocationOnce() {
    this.api.get(`trips/${this.tripId}/latest-location`).subscribe({
      next: (res) => {
        if (res && res.latitude && res.longitude) {
          this.location = res;
          this.updateMarker(res.latitude, res.longitude);
        }
      },
      error: (err) => {
        console.error('Error fetching initial location', err);
      }
    });
  }

  subscribeToRealTimeUpdates() {
    if (!this.trip?.schedule_id) return;
    const scheduleId = this.trip.schedule_id;

    // Connect and listen on private WebSockets channel
    this.echo.getEcho()
      .private(`schedules.${scheduleId}`)
      .listen('.App\\Events\\DriverLocationUpdated', (e: any) => {
        console.log('Real-time location received:', e);
        if (e && e.latitude && e.longitude) {
          this.location = {
            latitude: e.latitude,
            longitude: e.longitude
          };
          this.updateMarker(e.latitude, e.longitude);
        }
      });
  }

  updateMarker(lat: number, lng: number) {
    if (!this.map) return;

    if (!this.shuttleMarker) {
      const elBus = document.createElement('div');
      elBus.className = 'custom-div-icon';
      elBus.innerHTML = `<div style="background-color:#1a73e8; color:white; padding:8px; border-radius:50%; border:3px solid white; box-shadow:0 4px 15px rgba(26,115,232,0.4); display:flex; align-items:center; justify-content:center; transition: all 0.25s ease;">
                           <span class="material-symbols-outlined" style="font-size:22px; display:block;">directions_bus</span>
                         </div>`;
      this.shuttleMarker = new mapboxgl.Marker({ element: elBus })
        .setLngLat([lng, lat])
        .addTo(this.map);
      
      this.map.panTo([lng, lat]);
    } else {
      this.shuttleMarker.setLngLat([lng, lat]);
      
      // Auto-center camera only if the marker goes out of the current viewport to avoid camera shaking
      const bounds = this.map.getBounds();
      if (!bounds.contains([lng, lat])) {
        this.map.panTo([lng, lat]);
      }
    }
  }

  startStatusPolling() {
    this.statusPollingInterval = setInterval(() => {
      this.api.get(`trips/${this.tripId}`).subscribe({
        next: (res) => {
          if (res && res.status !== this.previousStatus) {
            this.previousStatus = res.status;
            this.showStatusNotification(res.status);
          }
          this.trip = res;
        },
        error: (err) => {
          console.error('Error polling trip status', err);
        }
      });
    }, 5000);
  }

  showStatusNotification(status: string) {
    const messages: { [key: string]: string } = {
      'scheduled': 'Perjalanan dijadwalkan',
      'boarding': 'Bus sedang naik penumpang',
      'on-going': 'Bus sedang dalam perjalanan',
      'arrived': 'Bus telah tiba di tujuan',
      'delayed': 'Bus mengalami keterlambatan',
      'completed': 'Perjalanan telah selesai'
    };

    const message = messages[status] || `Status: ${status}`;
    this.ui.showToast(message);
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'scheduled': 'badge-info',
      'boarding': 'badge-warning',
      'on-going': 'badge-success',
      'arrived': 'badge-primary',
      'delayed': 'badge-danger',
      'completed': 'badge-secondary'
    };
    return classes[status] || 'badge-secondary';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'scheduled': 'Dijadwalkan',
      'boarding': 'Naik Penumpang',
      'on-going': 'Dalam Perjalanan',
      'arrived': 'Tiba',
      'delayed': 'Terlambat',
      'completed': 'Selesai'
    };
    return labels[status] || status;
  }

  calculateETA(): number | null {
    if (!this.trip?.schedule?.departure_time) return null;

    const now = new Date().getTime();
    
    if (this.location && this.location.latitude && this.trip?.schedule?.destination && this.trip?.schedule?.origin) {
       const originCoords = this.getDestinationCoords(this.trip.schedule.origin);
       const destCoords = this.getDestinationCoords(this.trip.schedule.destination);
       if (originCoords && destCoords) {
         const totalDist = this.getDistanceFromLatLonInKm(originCoords[0], originCoords[1], destCoords[0], destCoords[1]);
         const distRemaining = this.getDistanceFromLatLonInKm(this.location.latitude, this.location.longitude, destCoords[0], destCoords[1]);
         
         const expectedDuration = (totalDist / 50) * 60;
         const remainingMinutes = Math.ceil((distRemaining / totalDist) * expectedDuration);
         return remainingMinutes;
       }
    }

    if (this.trip.status === 'on-going') {
      return null;
    }

    const departure = new Date(this.trip.schedule.departure_time).getTime();
    const duration = 120;
    const estimatedArrival = departure + (duration * 60 * 1000);
    const remaining = Math.max(0, estimatedArrival - now);

    return Math.ceil(remaining / (60 * 1000));
  }

  getDestinationCoords(destName: string): [number, number] | null {
    const name = destName.toLowerCase().trim();
    return this.coordinatesMap[name] || null;
  }

  getStopStatus(stopCoords: [number, number]): string {
    if (!this.location || !this.location.latitude) return 'pending';
    const dist = this.getDistanceFromLatLonInKm(this.location.latitude, this.location.longitude, stopCoords[1], stopCoords[0]);
    if (dist < 1.0) {
      return 'arrived';
    }
    // Check if driver already passed it
    const destName = this.trip?.schedule?.destination;
    if (destName) {
      const destCoords = this.getDestinationCoords(destName);
      if (destCoords) {
        const distCurrentToDest = this.getDistanceFromLatLonInKm(this.location.latitude, this.location.longitude, destCoords[0], destCoords[1]);
        const distStopToDest = this.getDistanceFromLatLonInKm(stopCoords[1], stopCoords[0], destCoords[0], destCoords[1]);
        if (distCurrentToDest < distStopToDest - 1.0) {
          return 'passed';
        }
      }
    }
    return 'pending';
  }

  getStopStatusLabel(stopCoords: [number, number]): string {
    const status = this.getStopStatus(stopCoords);
    if (status === 'arrived') return 'Mendekati / Berhenti';
    if (status === 'passed') return 'Sudah Dilewati';
    return 'Menunggu Kedatangan';
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
    const d = R * c; 
    return d;
  }

  deg2rad(deg: number) {
    return deg * (Math.PI/180);
  }

  async startUserLocationTracking() {
    try {
      const permissions = await Geolocation.checkPermissions();
      let status = permissions.location;
      if (status !== 'granted') {
        const req = await Geolocation.requestPermissions();
        status = req.location;
      }

      if (status === 'granted') {
        this.userLocationWatchId = await Geolocation.watchPosition(
          { enableHighAccuracy: true, timeout: 10000 },
          (position, err) => {
            if (position && position.coords) {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;
              this.updateUserMarker(lat, lng);
            }
          }
        );
      }
    } catch (e) {
      console.warn('Geolocation watch failed or not supported', e);
    }
  }

  updateUserMarker(lat: number, lng: number) {
    if (!this.map) return;

    if (!this.userMarker) {
      const elUser = document.createElement('div');
      elUser.className = 'user-location-marker-icon';
      elUser.innerHTML = `<div style="background-color:#2563eb; width:16px; height:16px; border-radius:50%; border:2px solid white; box-shadow:0 0 8px #2563eb; position:relative; display:flex; justify-content:center; align-items:center;">
                             <div style="background-color:rgba(37,99,235,0.3); width:36px; height:36px; border-radius:50%; position:absolute; animation: pulse 2s infinite;"></div>
                           </div>`;
      this.userMarker = new mapboxgl.Marker({ element: elUser })
        .setLngLat([lng, lat])
        .addTo(this.map);
    } else {
      this.userMarker.setLngLat([lng, lat]);
    }
  }

  formatETATime(minutes: number | null): string {
    if (minutes === null) return 'Menghitung...';
    if (minutes <= 0) return 'Tiba sekarang';
    if (minutes < 60) return `${minutes} Menit`;
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours} Jam`;
    }
    return `${hours} Jam, ${mins} Menit`;
  }
}
