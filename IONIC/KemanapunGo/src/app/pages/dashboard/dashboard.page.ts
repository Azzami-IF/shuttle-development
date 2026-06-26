import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { UiService } from '../../services/ui.service';
import { LanguageService } from '../../services/language.service';

@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage {
  user$ = this.auth.user$;
  lang$ = this.languageService.lang$;
  currentUser: any = null;
  previewSchedules: any[] = [];
  featuredSchedule: any = null;
  schedulePreviewLoading = false;
  searchData = {
    origin: 'Jakarta',
    destination: 'Bandung',
    date: new Date().toISOString().substring(0, 10)
  };

  promos = [
    {
      title: 'Hemat Akhir Pekan',
      discount: 'Diskon 20%',
      desc: 'Gunakan kode: WEEKENDHEBAT',
      color: 'linear-gradient(135deg, #18281e 0%, #536349 100%)'
    },
    {
      title: 'Rute Baru Karawang!',
      discount: 'Tarif Spesial',
      desc: 'Karawang - Bandung mulai Rp 50rb',
      color: 'linear-gradient(135deg, #536349 0%, #8e9e82 100%)'
    },
    {
      title: 'Pasti Nyaman & Aman',
      discount: 'Fasilitas Premium',
      desc: 'Free WiFi, AC dingin, & USB Charger',
      color: 'linear-gradient(135deg, #1b3324 0%, #152219 100%)'
    }
  ];

  popularRoutes = [
    { origin: 'Jakarta', destination: 'Bandung', price: 120000, gradient: 'linear-gradient(135deg, #18281e 0%, #2f3e35 100%)' },
    { origin: 'Bandung', destination: 'Jakarta', price: 120000, gradient: 'linear-gradient(135deg, #536349 0%, #64735b 100%)' },
    { origin: 'Karawang', destination: 'Bandung', price: 95000, gradient: 'linear-gradient(135deg, #2d3e33 0%, #536349 100%)' },
    { origin: 'Bekasi', destination: 'Bandung', price: 110000, gradient: 'linear-gradient(135deg, #1c2620 0%, #3e5346 100%)' }
  ];

  activePromoIndex = 0;
  promoInterval: any;

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private router: Router,
    private ui: UiService,
    private languageService: LanguageService
  ) {}

  ionViewWillEnter() {
    this.currentUser = this.getResolvedUser();
    if (this.currentUser?.role === 'customer') {
      this.loadSchedulePreview();
      this.startPromoRotation();
    }
  }

  ionViewWillLeave() {
    this.stopPromoRotation();
  }

  startPromoRotation() {
    this.stopPromoRotation();
    this.promoInterval = setInterval(() => {
      this.activePromoIndex = (this.activePromoIndex + 1) % this.promos.length;
    }, 4000);
  }

  stopPromoRotation() {
    if (this.promoInterval) {
      clearInterval(this.promoInterval);
    }
  }

  setActivePromo(index: number) {
    this.activePromoIndex = index;
    this.startPromoRotation();
  }

  isDragging = false;
  dragDeltaX = 0;
  transitionStyle = 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)';
  private touchStartX = 0;

  onTouchStart(event: TouchEvent) {
    this.stopPromoRotation();
    this.isDragging = true;
    this.touchStartX = event.touches[0].clientX;
    this.dragDeltaX = 0;
    this.transitionStyle = 'none';
  }

  onTouchMove(event: TouchEvent) {
    if (!this.isDragging) return;
    const currentX = event.touches[0].clientX;
    this.dragDeltaX = currentX - this.touchStartX;
  }

  onTouchEnd(event: TouchEvent) {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.transitionStyle = 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)';

    const threshold = 60;
    if (Math.abs(this.dragDeltaX) > threshold) {
      if (this.dragDeltaX > 0) {
        this.activePromoIndex = (this.activePromoIndex - 1 + this.promos.length) % this.promos.length;
      } else {
        this.activePromoIndex = (this.activePromoIndex + 1) % this.promos.length;
      }
    }
    this.dragDeltaX = 0;
    this.startPromoRotation();
  }

  onMouseDown(event: MouseEvent) {
    this.stopPromoRotation();
    this.isDragging = true;
    this.touchStartX = event.clientX;
    this.dragDeltaX = 0;
    this.transitionStyle = 'none';
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    const currentX = event.clientX;
    this.dragDeltaX = currentX - this.touchStartX;
  }

  onMouseUp(event: MouseEvent) {
    this.onTouchEnd(event as any);
  }

  onMouseLeave() {
    if (this.isDragging) {
      this.isDragging = false;
      this.transitionStyle = 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)';
      this.dragDeltaX = 0;
      this.startPromoRotation();
    }
  }

  getResolvedUser() {
    if (this.currentUser) {
      return this.currentUser;
    }

    const cached = localStorage.getItem('user');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }

    return null;
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    const g = this.languageService.get('greeting');
    const isId = this.languageService.getCurrentLang() === 'id';

    if (hour < 11) return isId ? `${g} Pagi` : `${g} Morning`;
    if (hour < 15) return isId ? `${g} Siang` : `${g} Afternoon`;
    if (hour < 18) return isId ? `${g} Sore` : `${g} Afternoon`;
    return isId ? `${g} Malam` : `${g} Evening`;
  }

  stripEmoji(name: string): string {
    if (!name) return '';
    return name.replace(/👋/g, '').trim();
  }

  getTranslation(key: string): string {
    return this.languageService.get(key);
  }

  showPending() {
    this.ui.showFeaturePending();
  }

  loadSchedulePreview() {
    this.schedulePreviewLoading = true;
    const params = new URLSearchParams({
      origin: this.searchData.origin,
      destination: this.searchData.destination,
      date: this.searchData.date,
    });

    this.api.get(`schedules?${params.toString()}`).subscribe({
      next: (res: any[]) => {
        const schedules = (res || []).slice().sort((a: any, b: any) => new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime());
        this.previewSchedules = schedules.slice(0, 3);
        this.featuredSchedule = schedules.length ? schedules[0] : null;
        this.schedulePreviewLoading = false;
      },
      error: () => {
        this.previewSchedules = [];
        this.featuredSchedule = null;
        this.schedulePreviewLoading = false;
      }
    });
  }

  refreshSchedulePreview() {
    this.loadSchedulePreview();
  }

  getAvailableSeats(schedule: any) {
    if (!schedule?.seats) return 0;
    return schedule.seats.filter((seat: any) => seat.status === 'available').length;
  }

  formatTime(value: string): string {
    if (!value) return '--:--';
    return new Date(value).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }

  getCountdownLabel(value: string): string {
    if (!value) return 'Jadwal tidak tersedia';

    const diffMs = new Date(value).getTime() - Date.now();
    if (diffMs <= 0) return 'Sedang berlangsung / siap berangkat';

    const diffMin = Math.round(diffMs / 60000);
    if (diffMin < 60) return `Berangkat dalam ${diffMin} menit`;

    const hours = Math.floor(diffMin / 60);
    const minutes = diffMin % 60;
    return `Berangkat dalam ${hours} jam ${minutes} menit`;
  }

  searchTickets() {
    this.router.navigate(['/schedule-list'], {
      queryParams: {
        origin: this.searchData.origin,
        destination: this.searchData.destination,
        date: this.searchData.date
      }
    });
  }

  selectPopularRoute(route: any) {
    this.searchData.origin = route.origin;
    this.searchData.destination = route.destination;
    this.searchTickets();
  }

  viewSchedule(id: number) {
    this.router.navigate(['/seat-selection', { id }]);
  }

  async confirmLogout() {
    const confirmed = await this.ui.showConfirm('Logout', 'Anda akan keluar dari akun ini. Lanjutkan?', 'Logout');
    if (!confirmed) {
      return;
    }

    this.auth.logout().subscribe({
      next: () => {
        this.currentUser = null;
        this.router.navigate(['/login'], { replaceUrl: true });
      },
      error: (err) => {
        console.error('Logout failed', err);
        this.currentUser = null;
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    });
  }
}
