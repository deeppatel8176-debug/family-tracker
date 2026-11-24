# Family Tracker — Production Family Location Sharing Platform

Family Tracker is a secure, responsive, voluntary family location sharing system. It enables family members to voluntarily share their real-time GPS locations with their family administrator through a native Android mobile application or an iOS Progressive Web App (PWA). The administrator monitors live positions on an interactive map, tracks member safety, views authorized location history, configures safe-zone geofences, and handles emergency SOS distress alerts.

---

## 1. System Architecture

```text
                                  ┌───────────────────────────────┐
                                  │   Google Maps Platform API    │
                                  └───────────────▲───────────────┘
                                                  │
                ┌─────────────────────────────────┴────────────────────────────────┐
                │                                                                  │
┌───────────────┴───────────────┐                                  ┌───────────────┴───────────────┐
│       Android Mobile App      │                                  │      iOS PWA Web Application  │
│   (Flutter / Material 3 SDK)  │                                  │     (Next.js / Geolocation)   │
└───────────────▲───────────────┘                                  └───────────────▲───────────────┘
                │ REST / WebSockets                                                │ REST / WebSockets
                │                                                                  │
                └───────────────────────────────┬──────────────────────────────────┘
                                                │
                               ┌────────────────▼────────────────┐
                               │       NestJS Backend API        │
                               │   (Socket.IO / JWT / Mongoose)  │
                               └────────────────┬────────────────┘
                                                │
                     ┌──────────────────────────┴──────────────────────────┐
                     │                                                     │
       ┌─────────────▼─────────────┐                         ┌─────────────▼─────────────┐
       │     MongoDB Database      │                         │  Admin Web Dashboard      │
       │ (Users, Families, Trails) │                         │  (Next.js / Tailwind CSS) │
       └───────────────────────────┘                         └───────────────────────────┘
```

---

## 2. Project Repositories & Technology Stack

| Component | Directory | Technology Stack | Key Features |
|---|---|---|---|
| **Backend API** | `/backend` | NestJS, TypeScript, MongoDB, Mongoose, Socket.IO, JWT, bcryptjs | Modular architecture, role-based auth, geofencing engine, stale detection, TTL retention |
| **Android Mobile App** | `/mobile-android` | Flutter 3.41, Dart, Material 3, Geolocator, Google Maps SDK, Provider | Voluntary tracking switch, foreground notifications, accuracy metrics, 1-touch SOS |
| **iOS PWA** | `/ios-pwa` | Next.js 14, TypeScript, Tailwind CSS, Browser Geolocation API, Service Worker | Safari "Add to Home Screen", standalone display mode, offline fallback, battery API |
| **Admin Dashboard** | `/admin-dashboard` | Next.js 14, TypeScript, Tailwind CSS, Recharts, Socket.IO Client | Real-time map, status badges, member management, geofence manager, SOS siren |

---

## 3. Privacy & Safety Guarantees

1. **Voluntary Sharing Control**: An administrator can **never** remotely activate GPS or override a member's location toggle. Only the member controls when location updates are transmitted.
2. **Transparent Stale State**: If an iOS PWA or Android device stops sending GPS coordinates (e.g., due to OS background suspension or network loss), the system never displays a false "Live" indicator. Coordinates older than the configured threshold are flagged as **Stale**.
3. **Data Isolation & Retention**: Location histories are indexed with MongoDB TTL expiration, automatically purging breadcrumbs older than the configured retention policy (default: 30 days).

---

## 4. API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/admin/register` — Create family group and register primary administrator
- `POST /api/auth/admin/login` — Administrator authentication
- `POST /api/auth/member/login` — Member login with device registration
- `POST /api/auth/refresh` — Token rotation using refresh token
- `POST /api/auth/logout` — Revoke device session
- `POST /api/auth/forgot-password` — Password recovery
- `POST /api/auth/reset-password` — Reset password with token

### Family Group (`/api/family`)
- `POST /api/family/create` — Create family group
- `GET /api/family/details` — Get family group settings
- `POST /api/family/invite` — Generate 7-day secure member invitation code
- `GET /api/family/members` — List all family members, devices, and current statuses
- `PATCH /api/family/members/:id` — Update member profile or suspend account
- `DELETE /api/family/members/:id` — Remove member and delete associated location records

### Member (`/api/members`)
- `POST /api/members/activate-account` — Activate account using invitation code & set password
- `GET /api/members/profile` — Get member profile
- `PATCH /api/members/profile` — Update member profile

### Location Tracking (`/api/locations`)
- `POST /api/locations/update` — Submit current GPS coordinate pulse (lat, lng, accuracy, altitude, speed, battery)
- `POST /api/locations/sharing/start` — Start voluntary location sharing
- `POST /api/locations/sharing/stop` — Stop location sharing
- `POST /api/locations/sharing/pause` — Pause location sharing
- `GET /api/locations/current` — Get latest location for all family members
- `GET /api/locations/member/:id` — Get latest location for specific member
- `GET /api/locations/history` — Query authorized chronological breadcrumb points

### Geofencing Safe Zones (`/api/geofences`)
- `POST /api/geofences` — Create safe zone (name, latitude, longitude, radius in meters)
- `GET /api/geofences` — List family safe zones
- `PATCH /api/geofences/:id` — Update safe zone
- `DELETE /api/geofences/:id` — Delete safe zone
- `GET /api/geofences/events` — Query arrival & departure logs

### Emergency SOS (`/api/sos`)
- `POST /api/sos/trigger` — Trigger emergency SOS alert with instant GPS coordinates
- `GET /api/sos/alerts` — Fetch SOS alerts
- `PATCH /api/sos/:id/acknowledge` — Administrator acknowledges alert
- `PATCH /api/sos/:id/cancel` — Cancel emergency alarm

### Dashboard (`/api/dashboard`)
- `GET /api/dashboard/overview` — Get high-level metrics & recent activity
- `GET /api/dashboard/recent-activity` — Recent security & geofence events
- `GET /api/dashboard/member-status` — Detailed live status snapshot of all members

---

## 5. Quick Start & Local Execution

### Prerequisites
- Node.js v18+ (tested on v22.14.0)
- MongoDB running locally on port 27017 or a MongoDB Atlas URI
- Flutter SDK (for Android app)

### 1. Start the Backend
```bash
cd backend
npm install
npm run build
npm run start:prod
# Server runs on http://localhost:4000
```

To run the automated E2E test suite:
```bash
cd backend
node test-backend.js
# Runs all 15 end-to-end API, geofence, SOS, and Socket.IO tests
```

### 2. Start the Admin Dashboard
```bash
cd admin-dashboard
npm install
npm run build
npm run start
# Dashboard opens on http://localhost:3000
```

### 3. Start the iOS PWA
```bash
cd ios-pwa
npm install
npm run build
npm run start
# PWA runs on http://localhost:3001
```

### 4. Run the Android Mobile App
```bash
cd mobile-android
flutter pub get
flutter test     # Run smoke tests
flutter run      # Launch in Android Emulator or attached device
```

---

## 6. Android APK Build & Download

To build a standalone release APK for direct installation from your website:
```bash
cd mobile-android
flutter build apk --release
```
The output APK is generated at:
`mobile-android/build/app/outputs/flutter-apk/app-release.apk`

---

## 7. Production Deployment (PM2 & Nginx)

1. Use `ecosystem.config.js` to manage all Node.js services with PM2:
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   ```
2. Copy `nginx/family-tracker.conf` to `/etc/nginx/sites-available/family-tracker` and enable it.
3. Configure your domain and Let's Encrypt SSL certificates.
