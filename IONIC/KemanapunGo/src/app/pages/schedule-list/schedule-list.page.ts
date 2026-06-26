import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';

@Component({
  standalone: false,
  selector: 'app-schedule-list',
  templateUrl: './schedule-list.page.html',
  styleUrls: ['./schedule-list.page.scss'],
})
export class ScheduleListPage {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private languageService = inject(LanguageService);

  schedules: any[] = [];
  displaySchedules: any[] = [];
  lang$ = this.languageService.lang$;
  loading: boolean = false;
  filters = {
    origin: '',
    destination: '',
    date: ''
  };
  sortBy: string = '';
  searchTerm: string = '';
  homeRoute = '/dashboard';
  user$ = this.auth.user$;
  navigatingToSeatSelection = false;

  // Autocomplete Properties
  cities: string[] = [
    'Jakarta', 'Bandung', 'Bekasi', 'Bogor', 'Depok', 
    'Karawang', 'Cirebon', 'Sumedang', 'Subang', 
    'Purwakarta', 'Cikampek'
  ];
  filteredOriginSuggestions: string[] = [];
  showOriginSuggestions: boolean = false;
  
  filteredDestSuggestions: string[] = [];
  showDestSuggestions: boolean = false;

  // Date strip list
  dateStrips: any[] = [];

  constructor() {}

  ionViewWillEnter() {
    this.homeRoute = this.auth.getHomeRoute();
    this.initializeDateStrips();
    this.route.queryParams.subscribe(params => {
      if (params['origin']) this.filters.origin = params['origin'];
      if (params['destination']) this.filters.destination = params['destination'];
      if (params['date']) this.filters.date = params['date'];
      this.loadSchedules();
    });
  }

  initializeDateStrips() {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dateVal = String(d.getDate()).padStart(2, '0');
      const value = `${year}-${month}-${dateVal}`;
      
      let label = '';
      if (i === 0) label = 'Hari Ini';
      else if (i === 1) label = 'Besok';
      else {
        const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        label = dayNames[d.getDay()];
      }
      
      days.push({
        value,
        label,
        dayNum: d.getDate()
      });
    }
    this.dateStrips = days;
  }

  selectDateStrip(value: string) {
    this.filters.date = value;
    this.loadSchedules();
  }

  loadSchedules() {
    this.loading = true;
    let params: any = {};
    if (this.filters.origin) params.origin = this.filters.origin;
    if (this.filters.destination) params.destination = this.filters.destination;
    if (this.filters.date) params.date = this.filters.date;

    const query = Object.keys(params)
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
      .join('&');

    const path = query ? `schedules?${query}` : 'schedules';

    this.api.get(path).subscribe((res: any) => {
      this.schedules = res || [];
      this.applySorting();
      this.applySearch();
      this.loading = false;
    });
  }

  applySorting() {
    if (this.sortBy === 'time') {
      this.schedules.sort((a, b) => new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime());
    } else if (this.sortBy === 'price') {
      this.schedules.sort((a, b) => (a.price || 85000) - (b.price || 85000));
    }
  }

  setSort(type: string) {
    this.sortBy = type;
    this.applySorting();
  }

  onFilterChange() {
    this.loadSchedules();
  }

  onDateSelect(event: any, popover: any) {
    const value = event.detail.value;
    if (value) {
      this.filters.date = value.split('T')[0];
    } else {
      this.filters.date = '';
    }
    this.loadSchedules();
    popover.dismiss();
  }

  applySearch() {
    const term = (this.searchTerm || '').toLowerCase().trim();
    if (!term) {
      this.displaySchedules = [...this.schedules];
      return;
    }

    this.displaySchedules = this.schedules.filter(s => {
      const origin = (s.origin || '').toString().toLowerCase();
      const dest = (s.destination || '').toString().toLowerCase();
      const vehicle = (s.vehicle?.name || '').toString().toLowerCase();
      return origin.includes(term) || dest.includes(term) || vehicle.includes(term);
    });
  }

  getAvailableSeats(schedule: any) {
    if (!schedule.seats) return 0;
    return schedule.seats.filter((s: any) => s.status === 'available').length;
  }

  viewSchedule(id: number) {
    this.navigatingToSeatSelection = true;
    this.router.navigate(['/seat-selection', { id }]);
  }

  ionViewWillLeave() {
    if (!this.navigatingToSeatSelection) {
      this.filters.origin = '';
      this.filters.destination = '';
      this.searchTerm = '';
    }
    this.navigatingToSeatSelection = false;
  }

  getTranslation(key: string) {
    return this.languageService.get(key);
  }

  // Autocomplete Autothread Methods
  onOriginFocus() {
    this.showOriginSuggestions = true;
    this.onOriginInput();
  }

  onOriginInput() {
    const val = (this.filters.origin || '').toLowerCase().trim();
    if (!val) {
      this.filteredOriginSuggestions = [...this.cities];
    } else {
      this.filteredOriginSuggestions = this.cities.filter(c => c.toLowerCase().includes(val));
    }
  }

  selectOrigin(city: string) {
    this.filters.origin = city;
    this.showOriginSuggestions = false;
    this.onFilterChange();
  }

  hideOriginSuggestions() {
    setTimeout(() => {
      this.showOriginSuggestions = false;
    }, 200);
  }

  onDestFocus() {
    this.showDestSuggestions = true;
    this.onDestInput();
  }

  onDestInput() {
    const val = (this.filters.destination || '').toLowerCase().trim();
    if (!val) {
      this.filteredDestSuggestions = [...this.cities];
    } else {
      this.filteredDestSuggestions = this.cities.filter(c => c.toLowerCase().includes(val));
    }
  }

  selectDest(city: string) {
    this.filters.destination = city;
    this.showDestSuggestions = false;
    this.onFilterChange();
  }

  hideDestSuggestions() {
    setTimeout(() => {
      this.showDestSuggestions = false;
    }, 200);
  }
}
