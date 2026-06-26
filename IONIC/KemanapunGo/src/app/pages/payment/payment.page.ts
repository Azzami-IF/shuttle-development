import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';
import { LanguageService } from '../../services/language.service';

@Component({
  standalone: false,
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
})
export class PaymentPage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private router = inject(Router);
  private auth = inject(AuthService);
  private ui = inject(UiService);
  private languageService = inject(LanguageService);

  bookingId: string | null = null;
  paymentCode: string | null = null;
  booking: any = null;
  relatedBookings: any[] = [];
  loadingBooking = true;
  loadError = '';
  createError = '';

  nominalValue = 0;
  nominalDisplay = 'Rp 0';
  isCreatingVa = false;

  screen: 'input' | 'detail' = 'input';
  vaData: any = null;
  countdown = '--:--:--';
  countdownTimer: any;
  homeRoute = '/dashboard';
  lang$ = this.languageService.lang$;
  bankDetails: any = null;

  stepsKeys = ['inputNominal', 'generateVa', 'payment', 'finish'];

  selectedFile: File | null = null;
  proofPreview: string | null = null;
  isUploading = false;

  constructor() {}

  ngOnInit() {
    this.homeRoute = this.auth.getHomeRoute();
    const paramMap = this.route.snapshot.paramMap;
    const queryMap = this.route.snapshot.queryParamMap;

    this.bookingId = paramMap.get('id') || queryMap.get('id');
    this.paymentCode = paramMap.get('payment_code') || queryMap.get('payment_code') || history.state?.payment_code || null;
    const stage = paramMap.get('stage') || queryMap.get('stage');

    if (stage === 'va-detail') {
      this.screen = 'detail';
    }

    const navVaData = history.state?.vaData;
    if (navVaData) {
      this.vaData = navVaData;
      this.screen = 'detail';
      this.startCountdown(new Date(navVaData.expiresAt));
    }

    if (!this.bookingId && !this.paymentCode) {
      this.loadingBooking = false;
      this.loadError = 'Data booking tidak ditemukan. Silakan ulangi proses pemesanan.';
      return;
    }

    this.loadBooking();
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

  ngOnDestroy() {
    this.stopCountdown();
  }

  loadBooking() {
    this.loadingBooking = true;
    this.loadError = '';

    this.api.get(this.getBookingUrl()).subscribe({
      next: (res: any) => {
        const payload = res?.bookings && Array.isArray(res.bookings) ? res.bookings[0] : res;
        this.booking = payload || null;
        this.relatedBookings = res?.bookings && Array.isArray(res.bookings) ? res.bookings : (payload ? [payload] : []);

        if (!this.booking) {
          this.loadingBooking = false;
          this.loadError = 'Data booking tidak ditemukan.';
          return;
        }

        this.loadingBooking = false;
        this.autoFillNominal();

        if (this.screen === 'detail' && !this.vaData) {
          this.createError = 'Detail Virtual Account belum tersedia. Silakan buat VA baru.';
        }
      },
      error: (err) => {
        this.loadingBooking = false;
        this.loadError = this.ui.getErrorMessage(err, 'Gagal memuat data booking.');
      }
    });
  }

  autoFillNominal() {
    // Beri jeda sebentar biar data binding-nya selesai
    setTimeout(() => {
      const amount = this.totalAmount;
      if (amount > 0 && (this.nominalValue === 0 || !this.nominalValue)) {
        this.nominalValue = amount;
        this.nominalDisplay = this.formatCurrency(amount);
        console.log('Autofill triggered with amount:', amount);
      }
    }, 300);
  }

  get customerName(): string {
    const localUser = JSON.parse(localStorage.getItem('user') || '{}');
    return this.booking?.user?.name || this.booking?.customer_name || localUser?.name || '-';
  }

  get bookingNumber(): string {
    return this.booking?.booking_code || `BOOK-${this.bookingId || '-'}`;
  }

  get customerEmail(): string {
    const localUser = JSON.parse(localStorage.getItem('user') || '{}');
    return this.booking?.user?.email || this.booking?.email || localUser?.email || '-';
  }

  get invoiceLabel(): string {
    return this.booking?.invoice_number || `Tagihan Booking #${this.bookingId || '-'}`;
  }

  get totalAmount(): number {
    // If we have related bookings, sum them up
    if (this.relatedBookings.length > 1) {
      return this.relatedBookings.reduce((sum, b) => {
        const price = b.total_price || b.price || b.schedule?.price || 0;
        return sum + Number(price);
      }, 0);
    }

    // Fallback to single booking logic
    const amount = this.booking?.total_price || 
                   this.booking?.price || 
                   this.booking?.schedule?.price || 
                   0;
    return Number(amount);
  }

  get footerNominal(): number {
    return this.nominalValue || this.totalAmount;
  }

  get canCreateVa(): boolean {
    return !this.loadingBooking && !!this.booking && this.nominalValue > 0 && !this.isCreatingVa;
  }

  get currentStep(): number {
    if (this.vaData?.status === 'PAID') {
      return 4;
    }
    if (this.screen === 'detail') {
      return 3;
    }
    if (this.isCreatingVa) {
      return 2;
    }
    return 1;
  }

  onNominalInput(event: any) {
    const rawValue = String(event?.detail?.value || '');
    const digitsOnly = rawValue.replace(/\D/g, '');

    if (!digitsOnly) {
      this.nominalValue = 0;
      this.nominalDisplay = 'Rp 0';
      return;
    }

    this.nominalValue = Number(digitsOnly);
    this.nominalDisplay = this.formatCurrency(this.nominalValue);
  }

  createVirtualAccount() {
    if (!this.booking) {
      this.createError = 'Booking belum tersedia. Silakan muat ulang halaman.';
      return;
    }

    if (this.nominalValue <= 0) {
      this.createError = 'Masukkan nominal pembayaran terlebih dahulu.';
      return;
    }

    this.createError = '';
    this.isCreatingVa = true;

    const payload = {
      amount: this.nominalValue,
      method: 'virtual_account',
    };

    this.api.post(`bookings/${this.bookingId}/virtual-account`, payload).subscribe({
      next: (res: any) => {
        this.isCreatingVa = false;
        const expiresAt = this.resolveExpiryDate(res?.expires_at);

        this.vaData = {
          vaNumber: this.bankDetails?.account_number || '005499009721',
          bankName: this.bankDetails?.bank_name || 'Bank',
          uniqueCode: res?.unique_code || 0,
          amount: Number(res?.amount || this.nominalValue),
          status: String(res?.status || 'PENDING').toUpperCase(),
          expiresAt,
        };

        this.screen = 'detail';
        this.startCountdown(expiresAt);

        this.router.navigate(['/payment', { id: this.bookingId, stage: 'va-detail' }], {
          replaceUrl: true,
          state: { vaData: this.vaData },
        });
      },
      error: () => {
        this.isCreatingVa = false;
        const expiresAt = this.resolveExpiryDate();

        this.vaData = {
          vaNumber: this.bankDetails?.account_number || '005499009721',
          bankName: this.bankDetails?.bank_name || 'Bank',
          uniqueCode: Math.floor(Math.random() * 899) + 100,
          amount: this.nominalValue,
          status: 'PENDING',
          expiresAt,
        };

        this.screen = 'detail';
        this.startCountdown(expiresAt);
        this.createError = '';

        void this.ui.showToast('VA dibuat dalam mode simulasi. Sinkronisasi server belum tersedia.', 'warning');

        this.router.navigate(['/payment', { id: this.bookingId, stage: 'va-detail' }], {
          replaceUrl: true,
          state: { vaData: this.vaData },
        });
      },
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.proofPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async uploadProofAndConfirm() {
    if (!this.selectedFile || !this.bookingId) return;

    this.isUploading = true;
    const formData = new FormData();
    formData.append('image', this.selectedFile);

    this.api.postFormData(`bookings/${this.bookingId}/upload-proof`, formData).subscribe({
      next: () => {
        // After upload, auto trigger confirm payment for ALL related bookings
        const confirmRequests = this.relatedBookings.map(b => 
          this.api.post(`bookings/${b.id}/confirm-payment`, {})
        );

        // We use a simple loop or forkJoin if we had it, but let's just confirm the main one 
        // as the admin will likely approve based on payment_code anyway.
        // Actually, let's confirm all to be safe and sync status.
        let confirmedCount = 0;
        confirmRequests.forEach(req => {
          req.subscribe({
            next: () => {
              confirmedCount++;
              if (confirmedCount === confirmRequests.length) {
                this.isUploading = false;
                void this.ui.showToast('Bukti transfer berhasil diunggah & dikonfirmasi (Semua Kursi)!', 'success');
                this.checkPaymentStatus();
              }
            },
            error: () => {
              confirmedCount++;
              if (confirmedCount === confirmRequests.length) {
                this.isUploading = false;
                this.checkPaymentStatus();
              }
            }
          });
        });
      },
      error: (err) => {
        this.isUploading = false;
        console.error('Upload error details:', err);
        const serverMsg = err.error?.message || 'Tidak dapat mengirim bukti transfer.';
        void this.ui.showAlert('Gagal Upload', `${serverMsg}\n(Pastikan gambar < 10MB dan format JPG/PNG)`);
      }
    });
  }

  private getBookingUrl(): string {
    if (this.paymentCode) {
      return `payment/bookings/${encodeURIComponent(this.paymentCode)}`;
    }

    return this.bookingId ? `bookings/${this.bookingId}` : '';
  }

  checkPaymentStatus() {
    if (!this.bookingId) return;

    this.api.get(this.getBookingUrl()).subscribe({
      next: (res: any) => {
        const bookingPayload = res?.bookings && Array.isArray(res.bookings) ? res.bookings[0] : res;
        const rawStatus = String(bookingPayload?.status || '').toLowerCase();
        console.log('DEBUG STATUS:', rawStatus);

        if (rawStatus === 'booked' || rawStatus === 'paid' || rawStatus === 'confirmed') {
          this.vaData.status = 'PAID';
          void this.ui.showToast('Pembayaran Berhasil! Pesanan Anda telah dikonfirmasi.', 'success');
        } else if (rawStatus === 'pending_verification') {
          this.vaData.status = 'WAITING'; // Gunakan status internal WAITING
          void this.ui.showToast('Bukti terkirim! Admin akan segera memverifikasi pembayaran Anda.', 'success');
        } else {
          void this.ui.showToast(`Status: ${rawStatus}. (Belum Lunas)`, 'warning');
        }
      },
      error: (err) => {
        void this.ui.showToast('Gagal terhubung ke server untuk cek status.', 'danger');
      }
    });
  }

  copyAccountNumber() {
    if (!this.vaData?.vaNumber) {
      return;
    }

    const text = String(this.vaData.vaNumber);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        void this.ui.showToast('Nomor Rekening berhasil disalin.', 'success');
      }).catch(() => {
        this.copyUsingTextarea(text);
      });
      return;
    }

    this.copyUsingTextarea(text);
  }

  backToNominalInput() {
    this.screen = 'input';
    this.createError = '';
    this.stopCountdown();
    this.router.navigate(['/payment', { id: this.bookingId }], { replaceUrl: true });
  }

  startCountdown(expiresAt: Date) {
    this.stopCountdown();

    const updateCountdown = () => {
      const remainingSeconds = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
      this.countdown = this.formatCountdown(remainingSeconds);

      if (remainingSeconds <= 0) {
        this.stopCountdown();
        if (this.vaData && this.vaData.status !== 'PAID') {
          this.vaData.status = 'EXPIRED';
          this.createError = 'Masa berlaku VA telah habis. Silakan buat Virtual Account baru.';
        }
      }
    };

    updateCountdown();
    this.countdownTimer = setInterval(updateCountdown, 1000);
  }

  stopCountdown() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }

  resolveExpiryDate(value?: string): Date {
    if (value) {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    return new Date(Date.now() + 15 * 60 * 1000);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  }

  formatCountdown(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':');
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PAID':
        return this.getTranslation('finish');
      case 'WAITING':
        return 'Menunggu Verifikasi Admin';
      case 'EXPIRED':
        return this.languageService.getCurrentLang() === 'en' ? 'Expired' : 'Kadaluarsa';
      default:
        return this.languageService.getCurrentLang() === 'en' ? 'Awaiting Payment' : 'Menunggu Pembayaran';
    }
  }

  getTranslation(key: string) {
    return this.languageService.get(key);
  }

  private generateFallbackVaNumber(): string {
    return this.bankDetails?.account_number || '005499009721';
  }

  private copyUsingTextarea(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();

    try {
      document.execCommand('copy');
      void this.ui.showToast('Nomor VA berhasil disalin.', 'success');
    } catch {
      void this.ui.showAlert('Gagal Menyalin', 'Silakan salin nomor VA secara manual.');
    } finally {
      document.body.removeChild(textArea);
    }
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

  goHome() {
    this.router.navigate(['/dashboard'], { replaceUrl: true });
  }

  goBack() {
    this.router.navigate(['/booking-detail'], { replaceUrl: true });
  }
}
