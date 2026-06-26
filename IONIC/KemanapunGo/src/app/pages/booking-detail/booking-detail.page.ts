import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';
import { LanguageService } from '../../services/language.service';
import { environment } from '../../../environments/environment';

@Component({
  standalone: false,
  selector: 'app-booking-detail',
  templateUrl: './booking-detail.page.html',
  styleUrls: ['./booking-detail.page.scss'],
})
export class BookingDetailPage {
  private api = inject(ApiService);
  private router = inject(Router);
  private auth = inject(AuthService);
  private ui = inject(UiService);
  private languageService = inject(LanguageService);

  bookings: any[] = [];
  searchTerm: string = '';
  homeRoute = '/dashboard';
  expandedId: number | null = null;
  ticketModalOpen = false;
  selectedBooking: any = null;
  lang$ = this.languageService.lang$;
  user$ = this.auth.user$;
  bankDetails: any = null;
  storageUrl = environment.apiUrl.replace('/api', '/storage/');

  constructor() { }

  ionViewWillEnter() {
    this.homeRoute = this.auth.getHomeRoute();
    this.loadBookings();
    this.loadBankDetails();
  }

  loadBankDetails() {
    this.api.get('payment-info').subscribe({
      next: (res) => {
        this.bankDetails = res;
      },
      error: (err) => console.error('Error loading bank details', err)
    });
  }

  loadBookings() {
    let path = 'bookings';
    if (this.searchTerm) {
      path += `?search=${encodeURIComponent(this.searchTerm)}`;
    }

    this.api.get(path).subscribe({
      next: (res: any[]) => {
        const groupedMap = new Map<string, any>();

        res.forEach(booking => {
          if (booking.status === 'cancelled') return;
          const key = booking.payment_code || `SINGLE-${booking.id}`;
          const seatPrice = parseFloat(booking.total_price) || parseFloat(booking.schedule?.price) || 85000;
          const uniqueCode = parseFloat(booking.unique_code) || 0;
          
          if (!groupedMap.has(key)) {
            groupedMap.set(key, {
              ...booking,
              _seats: [booking.seat],
              _base_subtotal: seatPrice,
              _total_price: seatPrice + uniqueCode
            });
          } else {
            const group = groupedMap.get(key);
            group._seats.push(booking.seat);
            group._base_subtotal += seatPrice;
            group._total_price += seatPrice;
          }
        });

        this.bookings = Array.from(groupedMap.values()).sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      },
      error: (err) => {
        console.error('Error loading bookings', err);
      }
    });
  }

  onSearchChange() {
    this.loadBookings();
  }

  toggleExpand(id: number) {
    this.expandedId = this.expandedId === id ? null : id;
  }

  openTicket(booking: any) {
    this.selectedBooking = booking;
    this.ticketModalOpen = true;
  }

  closeTicket() {
    this.ticketModalOpen = false;
    this.selectedBooking = null;
  }

  getCityCode(city: string): string {
    if (!city) return '---';
    const words = city.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return city.substring(0, 3).toUpperCase();
  }

  // Database Durasi Perjalanan Riil (Jam)
  private travelDurations: { [key: string]: number } = {
    'karawang_yogyakarta': 7,
    'karawang_bandung': 1.5,
    'karawang_jakarta': 1.5,
    'karawang_semarang': 5.5,
    'karawang_surabaya': 9,
    'jakarta_yogyakarta': 8,
    'jakarta_bandung': 3,
    'jakarta_surabaya': 10,
    'jakarta_semarang': 6,
    'bandung_yogyakarta': 6.5,
    'bandung_surabaya': 9.5,
    'semarang_surabaya': 4,
    'yogyakarta_surabaya': 4.5
  };

  getEstimatedArrival(booking: any): string | null {
    if (!booking.schedule?.departure_time) return null;
    
    const departure = new Date(booking.schedule.departure_time);
    const origin = booking.schedule.origin?.toLowerCase() || '';
    const destination = booking.schedule.destination?.toLowerCase() || '';
    
    // Default duration (3 hours)
    let durationHours = 3;

    // Realistic Durations (Pulau Jawa)
    if (origin.includes('malang') && destination.includes('karawang')) durationHours = 12;
    else if (origin.includes('karawang') && destination.includes('malang')) durationHours = 12;
    else if (origin.includes('bandung') && destination.includes('banyuwangi')) durationHours = 16;
    else if (origin.includes('banyuwangi') && destination.includes('bandung')) durationHours = 16;
    else if (origin.includes('jakarta') && destination.includes('malang')) durationHours = 13;
    else if (origin.includes('jakarta') && destination.includes('surabaya')) durationHours = 10;
    else if (origin.includes('sumedang') && destination.includes('karawang')) durationHours = 3.5;
    else if (origin.includes('purwakarta') && destination.includes('subang')) durationHours = 1.5;
    else if (origin.includes('karawang') && destination.includes('semarang')) durationHours = 6;
    else {
        // Fallback to existing map if available
        const key = `${origin}_${destination}`;
        const keyReverse = `${destination}_${origin}`;
        durationHours = this.travelDurations[key] || this.travelDurations[keyReverse] || 3;
    }
    
    const arrival = new Date(departure.getTime() + (durationHours * 60 * 60 * 1000));
    
    // Flag if it arrives next day
    booking._isNextDay = arrival.getDate() !== departure.getDate();
    
    return arrival.toISOString();
  }

  onFileSelected(event: any, booking: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadProof(file, booking);
    }
  }

  async uploadProof(file: File, booking: any) {
    await this.ui.showLoading(this.getLanguage() === 'id' ? 'Mengunggah...' : 'Uploading...');

    const formData = new FormData();
    formData.append('image', file);

    this.api.postFormData(`bookings/${booking.id}/upload-proof`, formData).subscribe({
      next: (res: any) => {
        void this.ui.hideLoading();
        booking.payment_proof = res.payment_proof;
        void this.ui.showToast(
          this.getLanguage() === 'id' ? 'Bukti bayar berhasil diunggah' : 'Payment proof uploaded successfully',
          'success'
        );
      },
      error: (err) => {
        void this.ui.hideLoading();
        void this.ui.showToast(
          this.getLanguage() === 'id' ? 'Gagal mengunggah bukti bayar' : 'Failed to upload payment proof',
          'danger'
        );
        console.error('Upload error', err);
      }
    });
  }

  getLanguage() {
    return this.languageService.getCurrentLang();
  }

  async copyTicketNumber() {
    const code = this.selectedBooking?.booking_code || `BOOK-${this.selectedBooking?.id || '-'}`;
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(code);
    }
    void this.ui.showToast('Nomor tiket disalin!', 'success');
  }

  viewTracking(booking: any) {
    if (booking.schedule?.trip?.id) {
      this.router.navigate(['/trip-tracking', { id: booking.schedule.trip.id }]);
    }
  }

  isTrackable(booking: any): boolean {
    if (!booking.schedule?.trip) return false;
    const trackableStatuses = ['scheduled', 'boarding', 'on-going', 'arrived', 'delayed', 'completed'];
    return trackableStatuses.includes(booking.schedule.trip.status);
  }

  getSeatLabel(seat: any): string {
    if (!seat || !seat.seat_number) return '';
    const index = parseInt(seat.seat_number, 10) - 1;
    if (isNaN(index)) return seat.seat_number;
    const rowNum = Math.floor(index / 4) + 1;
    const colIndex = index % 4;
    const letters = ['A', 'B', 'C', 'D'];
    return `${rowNum}${letters[colIndex]}`;
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending_payment': return this.getTranslation('unpaid');
      case 'pending_verification': return this.getTranslation('awaitingVerification');
      case 'booked': return this.getTranslation('paid');
      case 'cancelled': return this.getTranslation('cancelled');
      case 'completed': return this.getTranslation('finish');
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending_payment': return 'status-unpaid';
      case 'pending_verification': return 'status-waiting';
      case 'booked': return 'status-paid';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }

  getTranslation(key: string) {
    return this.languageService.get(key);
  }

  async copyAccountNumber(event: Event) {
    event.stopPropagation();
    const accountNumber = '1962757389';
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(accountNumber);
    }
    void this.ui.showToast('Nomor rekening disalin!', 'success');
  }

  async confirmPayment(booking: any) {
    const bankName = this.bankDetails?.bank_name || 'Bank';
    const title = this.languageService.getCurrentLang() === 'en' ? 'Confirm Payment' : 'Konfirmasi Pembayaran';
    const msg = this.languageService.getCurrentLang() === 'en'
      ? `I confirm that I have transferred the exact amount to the ${bankName} account.`
      : `Saya konfirmasi telah melakukan transfer ke rekening ${bankName}.`;
    const okBtn = this.languageService.getCurrentLang() === 'en' ? 'Confirm' : 'Konfirmasi';
    const cancelBtn = this.languageService.getCurrentLang() === 'en' ? 'Cancel' : 'Batal';

    const confirmed = await this.ui.showConfirm(title, msg, okBtn, cancelBtn);
    if (!confirmed) return;

    const loading = await this.ui.showLoading('Memproses konfirmasi...');
    this.api.post(`bookings/${booking.id}/confirm-payment`, {}).subscribe({
      next: () => {
        void loading.dismiss();
        void this.ui.showToast('Pembayaran berhasil dikonfirmasi! Menunggu verifikasi admin.', 'success');
        this.expandedId = null;
        this.loadBookings();
      },
      error: (err) => {
        void loading.dismiss();
        void this.ui.showAlert('Gagal Konfirmasi', 'Terjadi kesalahan saat memproses pembayaran.');
        console.error(err);
      }
    });
  }

  async cancelBooking(booking: any) {
    const title = this.getTranslation('cancelBookingTitle');
    const msg = this.getTranslation('cancelBookingMessage');
    const okBtn = this.getTranslation('confirmCancelBtn');
    const cancelBtn = this.getTranslation('keepBookingBtn');

    const confirmed = await this.ui.showConfirm(title, msg, okBtn, cancelBtn);
    if (!confirmed) return;

    const loading = await this.ui.showLoading('Membatalkan pesanan...');
    this.api.post(`bookings/${booking.id}/cancel`, {}).subscribe({
      next: () => {
        void loading.dismiss();
        void this.ui.showToast('Pesanan berhasil dibatalkan.', 'success');
        this.expandedId = null;
        this.loadBookings();
      },
      error: (err) => {
        void loading.dismiss();
        void this.ui.showAlert('Gagal Batal', 'Terjadi kesalahan saat membatalkan pesanan.');
        console.error(err);
      }
    });
  }
}
