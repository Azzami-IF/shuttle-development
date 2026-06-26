# Shuttle Development 🚐💨

Repositori ini berisi kode sumber lengkap untuk proyek **Shuttle Booking & Tracking System**, yang terdiri dari aplikasi frontend mobile (Ionic/Angular) dan backend API (Laravel).

## 📂 Struktur Repositori

```text
shuttle-development/
├── IONIC/
│   ├── DriverpunGo/       # Aplikasi mobile untuk Driver (Ionic/Angular)
│   └── KemanapunGo/       # Aplikasi mobile untuk Penumpang (Ionic/Angular)
├── shuttle-backend/       # Backend API & Admin Panel (Laravel)
├── sql-query/             # Database backup & queries (.sql)
└── README.md
```

---

## 🛠️ Tech Stack

### Frontend Mobile
- **Core Framework**: Ionic 7 + Angular 18 + Capacitor
- **Maps & Tracking**: Mapbox SDK
- **Real-time Event**: Pusher Channels client

### Backend API & Admin
- **Framework**: Laravel 12
- **Database**: MySQL
- **Real-time Event**: Pusher Channels server
- **Authentication**: Laravel Sanctum

---

## 📦 Panduan Instalasi & Menjalankan Aplikasi

### 1. Persyaratan Sistem (Prerequisites)
Pastikan Anda sudah menginstal:
- **PHP** >= 8.2 & **Composer**
- **Node.js** >= 18 & **npm**
- **MySQL** >= 8.0

---

### 2. Konfigurasi Backend (Laravel)

1. Masuk ke folder backend:
   ```bash
   cd shuttle-backend
   ```
2. Instal semua dependensi Composer:
   ```bash
   composer install
   ```
3. Duplikat file konfigurasi environment:
   ```bash
   cp .env.example .env
   ```
   *Sesuaikan konfigurasi database (`DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`), Pusher, dan Mapbox di dalam file `.env`.*
4. Generate application key:
   ```bash
   php artisan key:generate
   ```
5. Jalankan migrasi dan seeder database:
   ```bash
   php artisan migrate --seed
   ```
6. Jalankan local development server:
   ```bash
   php artisan serve
   ```
   *Secara default API akan berjalan di `http://localhost:8000`.*

---

### 3. Konfigurasi Frontend (Ionic / Angular)

Terdapat dua aplikasi frontend di dalam folder `IONIC/`:
- **KemanapunGo** (Penumpang)
- **DriverpunGo** (Driver)

Untuk setiap aplikasi (lakukan langkah berikut di kedua direktori tersebut):

1. Masuk ke direktori aplikasi:
   ```bash
   cd IONIC/KemanapunGo
   # ATAU
   cd IONIC/DriverpunGo
   ```
2. Instal dependensi npm:
   ```bash
   npm install
   ```
3. Sesuaikan konfigurasi environment di file:
   - `src/environments/environment.ts` (Development)
   - `src/environments/environment.prod.ts` (Production)
   
   *Contoh isi konfigurasi:*
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:8000/api', // URL API Backend Laravel Anda
     mapboxToken: 'YOUR_MAPBOX_PUBLIC_TOKEN',
     pusherKey: 'YOUR_PUSHER_KEY',
     pusherCluster: 'ap1'
   };
   ```
4. Jalankan aplikasi di browser (development mode):
   ```bash
   ionic serve
   ```

---

## 💾 Database Query

Skema database awal dan query SQL yang digunakan dapat ditemukan di folder `sql-query/`.