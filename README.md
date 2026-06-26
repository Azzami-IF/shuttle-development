# shuttle-development

## 🛠️ Tech Stack

- **Frontend**: Ionic 7, Angular 18, Capacitor
- **Backend**: Laravel 12, MySQL
- **Real-time**: Pusher Channels
- **Maps**: Mapbox
- **Authentication**: Laravel Sanctum

## 📦 Installation

### Prerequisites

- PHP >= 8.2
- Composer
- MySQL >= 8.0
- Node.js >= 18
- npm >= 9
- Laravel CLI (optional)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   composer install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials and other settings

4. **Generate application key**
   ```bash
   php artisan key:generate
   ```

5. **Run database migrations**
   ```bash
   php artisan migrate
   ```

6. **Seed the database**
   ```bash
   php artisan db:seed
   ```

7. **Start development server**
   ```bash
   php artisan serve
   ```

### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shuttle-development
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env