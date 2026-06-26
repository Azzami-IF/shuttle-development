# Admin UI Quick Start Guide

## 🚀 Getting Started

All admin pages are ready to use and integrated into your Ionic app. They are standalone components that work with the existing AdminService.

## 📍 Navigation Routes

### Direct URL Navigation
```
/admin/dashboard              - Main admin dashboard
/admin/admin-users            - User management
/admin/admin-drivers          - Driver management
/admin/admin-vehicles         - Vehicle management
/admin/admin-schedules        - Schedule management
/admin/admin-bookings         - Booking management
/admin/admin-reports          - Reports & analytics
/admin/admin-system           - System monitoring
```

### Programmatic Navigation (TypeScript)
```typescript
import { Router } from '@angular/router';

constructor(private router: Router) {}

navigate() {
  this.router.navigate(['/admin/dashboard']);
  this.router.navigate(['/admin/admin-users']);
  // etc...
}
```

## 🎯 Page Features Overview

### Admin Dashboard (`/admin/dashboard`)
- **Stats Display**: 6 key metrics in gradient cards
- **Health Monitoring**: System status, database, API, memory, CPU
- **Analytics**: 7-day and 30-day charts
- **Quick Actions**: Navigation buttons to all pages
- **Auto-refresh**: Pull-to-refresh support

**Key Interactions**:
- Click stat cards to navigate to detail pages
- Click "Refresh" button for manual refresh
- Pull down to refresh data

### Admin Users (`/admin/admin-users`)
- **List View**: Paginated user list (20 per page)
- **Filtering**: Filter by role (customer, driver, admin)
- **Search**: Search by name, email, or phone
- **CRUD Operations**:
  - ➕ New User button → opens create form modal
  - ✏️ Edit button → pre-fills edit form
  - 🗑️ Delete button → confirmation alert

**Form Fields**:
- Name (required)
- Email (required, email format)
- Phone (required)
- Role (dropdown: customer, driver, admin)
- Password (required for new users)

### Admin Drivers (`/admin/admin-drivers`)
- **List View**: Paginated driver list (20 per page)
- **Stats**: License, trips, completion rate, rating
- **Status Badges**: Active/Inactive, Approved/Pending
- **Actions**:
  - 👁️ View button → opens details modal
  - ✅ Approve button (if pending) → confirms and approves

**Details Modal Shows**:
- Complete driver information
- Completion rate progress bar
- Rating progress bar
- Approval status
- Trip statistics

### Admin Vehicles (`/admin/admin-vehicles`)
- **List View**: Paginated vehicle list (20 per page)
- **Search**: By registration number or model
- **CRUD Operations**:
  - ➕ New Vehicle button → opens create form
  - ✏️ Edit button → pre-fills edit form
  - 🗑️ Delete button → confirmation alert

**Form Fields**:
- Registration Number (required, e.g., ABC1234)
- Vehicle Type (dropdown: car, van, truck)
- Make (required, e.g., Toyota)
- Model (required, e.g., Corolla)
- Year (required, numeric)
- Capacity (required, minimum 1 seat)

### Admin Schedules (`/admin/admin-schedules`)
- **List View**: Paginated schedule list (20 per page)
- **Search**: By origin or destination
- **Routing Info**: Shows complete route details
- **Seat Availability**: Color-coded badges
  - 🟢 Green: >50% available
  - 🟡 Yellow: 20-50% available
  - 🔴 Red: <20% available
- **Actions**:
  - ➕ New Schedule button → opens create form
  - 🗑️ Delete button → confirmation alert

**Form Fields**:
- Vehicle ID (required)
- Driver ID (required)
- Origin (required)
- Destination (required)
- Departure Time (required, datetime)
- Arrival Time (required, datetime)
- Total Seats (required, min 1)
- Price (required, min 0)

### Admin Bookings (`/admin/admin-bookings`)
- **List View**: Paginated booking list (20 per page)
- **Filtering**: Filter by status
  - pending_payment
  - booked
  - cancelled
  - completed
- **Search**: By user name or route
- **Status Indicators**: Color-coded badges
- **Actions**:
  - 👁️ View button → opens details modal
  - ✅ Approve (pending_payment only) → approves payment
  - ❌ Cancel → cancels booking with confirmation

**Details Modal Shows**:
- Booking ID
- Status (with badge)
- Route information
- Passenger details
- Seat count
- Price and payment method
- Payment reference
- Booking date

### Admin Reports (`/admin/admin-reports`)
- **Daily Report**:
  - Date picker (max today)
  - Metrics: Bookings, Trips, Revenue, Distance, Active Drivers
  - 5 metric cards with icons
  
- **Monthly Report**:
  - Month picker
  - Detailed statistics with descriptions
  - Progress bars for:
    - Revenue Target Achievement
    - Customer Rating (0-5)

**Available Metrics**:
- Total Bookings
- Completed Trips
- Total Revenue
- Total Distance (km)
- Active Drivers
- Average Rating

### Admin System (`/admin/admin-system`)
- **Health Status**:
  - Overall Status (Healthy/Unhealthy)
  - Database Status
  - API Status
  - System Uptime
  
- **Resource Monitoring**:
  - Memory Usage (%)
  - CPU Usage (%)
  - Disk Usage (%)
  - All with color-coded progress bars
  
- **Alerts**: System alerts (critical, warning, info)
- **Activity Logs**: Recent system activities (last 10)
- **Auto-refresh**: Toggle for 30-second refresh interval

## 🎨 Visual Design Features

### Color Scheme
- **Success**: #2ecc71 (Green) - Active, Approved, Healthy
- **Warning**: #f39c12 (Orange) - Pending, Caution, High Usage
- **Danger**: #e74c3c (Red) - Inactive, Rejected, Critical
- **Primary**: #3880ff (Blue) - Actions, Information
- **Primary Background**: Gradient cards with unique colors per stat

### Responsive Layout
- Desktop: Full-width cards with optimal sizing
- Tablet: Adjusted grid layouts
- Mobile: Stacked cards, single-column lists

### Interactive Elements
- Pull-to-refresh on all pages
- Loading spinners during data fetch
- Error cards for failed operations
- Confirmation alerts for destructive actions
- Modal dialogs for forms
- Pagination controls
- Search and filter inputs

## 🔄 Common Workflows

### Creating a User
1. Navigate to `/admin/admin-users`
2. Click "New User" button
3. Fill in required fields in modal
4. Click "Save"
5. User is created and list is refreshed

### Approving a Driver
1. Navigate to `/admin/admin-drivers`
2. Find pending driver in list
3. Click "View" button
4. In modal, click "Approve Driver"
5. Confirm approval
6. Status updates to "Approved"

### Creating a Schedule
1. Navigate to `/admin/admin-schedules`
2. Click "New Schedule" button
3. Fill in:
   - Vehicle and Driver IDs
   - Origin and Destination
   - Times and Seats
   - Price
4. Click "Save"
5. Schedule is created

### Handling Pending Bookings
1. Navigate to `/admin/admin-bookings`
2. Filter by "pending_payment"
3. Click "View" on a booking
4. Verify details
5. Click "Approve Payment" if legitimate
6. Status changes to "booked"

### Monitoring System Health
1. Navigate to `/admin/admin-system`
2. Check Overall Status (green = healthy)
3. Monitor resource usage:
   - If Memory > 80% → Warning
   - If CPU > 80% → Warning
   - If Disk > 85% → Critical
4. Review Alerts section for issues
5. Check Activity Logs for recent actions

## 📱 Mobile Considerations

All pages are fully responsive:
- Touch-friendly button sizes (min 48px)
- Large touch targets for form inputs
- Vertical list layouts on mobile
- Swipe-to-refresh support
- Optimized font sizes
- Proper spacing and padding

## 🔒 Security

All routes protected with `AuthGuard`:
- Requires user to be logged in
- Check user role/permissions in your auth service
- Admin-specific validation on backend

## 🛠️ Customization

### Change Colors
Edit `.scss` files in each page directory:
```scss
.stat-card {
  background: linear-gradient(135deg, YOUR_COLOR1, YOUR_COLOR2);
}
```

### Modify Table Columns
Update the `ion-label` section in `.html` templates to show different fields.

### Change Pagination Size
Update `per_page` value in `.ts` files:
```typescript
per_page: 50  // Instead of 20
```

### Add Auto-Refresh
Uncomment the interval-based refresh in component:
```typescript
interval(30000).pipe(...).subscribe(...)
```

## 📊 Data Sources

All data comes from the backend API endpoints:

```
GET  /admin/dashboard/stats
GET  /admin/dashboard/bookings?days=7
GET  /admin/dashboard/revenue?days=30
GET  /admin/system/health
GET  /admin/system/logs

GET  /admin/users?per_page=20&page=1&role=&search=
POST /admin/users
PUT  /admin/users/{id}
DELETE /admin/users/{id}

GET  /admin/drivers?per_page=20&page=1
PUT  /admin/drivers/{id}/approve

GET  /admin/vehicles?per_page=20&page=1&search=
POST /admin/vehicles
PUT  /admin/vehicles/{id}
DELETE /admin/vehicles/{id}

GET  /admin/schedules?per_page=20&page=1&search=
POST /admin/schedules
DELETE /admin/schedules/{id}

GET  /admin/bookings?per_page=20&page=1&status=&search=
POST /admin/bookings/{id}/approve
POST /admin/bookings/{id}/cancel

GET  /admin/reports/daily?date=2024-01-15
GET  /admin/reports/monthly?month=2024-01
```

## 🚨 Error Handling

Each page includes:
- Error message cards at top
- Try-catch for API calls
- Graceful fallbacks for missing data
- Retry capability (refresh button)
- Console logging for debugging

## ✨ Tips & Tricks

1. **Fast Navigation**: Use dashboard quick action buttons
2. **Bulk Operations**: Consider adding bulk delete/update (future enhancement)
3. **Export Data**: CSV export could be added to reports
4. **Real-time Updates**: WebSocket could replace polling
5. **Advanced Filters**: Date range filters for reports
6. **Charts**: Integrate Chart.js for better visualizations

---

**Version**: 1.0  
**Last Updated**: 2024  
**Status**: Production Ready ✅
