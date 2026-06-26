# Admin UI & Driver Operational Improvements

This plan covers the final stages of the UI audit, focusing on the Admin dashboard and refinement of driver operational views.

## 1. Admin UI Standardization
Align the Admin dashboard and management pages with the "Serene Transit" (Forest Green) design system.
- **Pages**: `admin-dashboard`, `admin-users`, `admin-drivers`, `admin-vehicles`, `admin-schedules`, `admin-bookings`.
- **Changes**:
    - Update color variables from purple/pink to primary greens (`#18281e`, `#536349`).
    - Standardize headers with `pt-safe`.
    - Improve mobile layout for stat cards (2-column grid instead of 1-column stack where appropriate).

## 2. Driver Operational Refinement
- **Driver Login**: Fix the fixed header to respect safe areas and ensure the split layout collapses gracefully on small mobiles.
- **Control Panel (`driver-tracking`)**:
    - Standardize status badges and buttons.
    - Improve the passenger list cards for better vertical space usage.
    - Ensure the "Update Location" button is easily accessible.

## 3. Navigation & Consistency Clean-up
- **Redundancy**: Remove or redirect `/driver-status` in favor of `/driver-history` to eliminate duplication.
- **Bottom Nav**: Ensure the Driver bottom nav is identical across all related pages.
- **Onboarding**: Minor polish to the bottom sheet handle and padding.

## 4. Visual Polishing (Small Details)
- Ensure all `ion-searchbar` components are properly padded.
- Fix any remaining `ion-content` overlaps with fixed headers/footers.

## Verification Plan

### Manual Verification
- **Admin Flow**: Dashboard -> Users -> Edit User -> Dashboard.
- **Driver Ops**: Driver Login -> Dashboard -> Tracking (Status Updates) -> History.
- **Accessibility**: Check contrast on Admin stat cards.
- **Safe Areas**: Verify status bar padding on all new/updated headers.
