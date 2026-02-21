# Busplot

A bus arrival tracking app for Singapore. Shows your location on a map and nearby bus stops with real-time arrival times from LTA DataMall.

- **Mobile:** React Native (Expo) — dark theme, map + list
- **Backend:** Spring Boot — proxies LTA DataMall APIs

## Project structure

```
busplot/
├── backend/     # Spring Boot REST API (Java 17) — LTA DataMall
├── mobile/      # React Native app (Expo) for iOS & Android
├── docs/        # Architecture, LTA API reference
└── README.md
```

## Prerequisites

- **Backend:** Java 17, Maven, [LTA DataMall API key](https://datamall.lta.gov.sg/)
- **Mobile:** Node.js 18+, npm or yarn

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env   # Add your LTA_API_KEY
./mvnw spring-boot:run
```

API runs at `http://localhost:8080`.

### 2. Mobile

```bash
cd mobile
npm install
npm start
```

Press `a` for Android, `i` for iOS, or scan the QR code with Expo Go.

**Physical device:** Ensure your phone and computer are on the same network. Update `mobile/src/services/api.ts` to use your computer's IP (e.g. `http://192.168.1.5:8080`) instead of `localhost`.

## API endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /bus/stops` | All bus stops |
| `GET /bus/stops/nearby?lat=&lng=&radiusKm=3` | Nearby stops |
| `GET /bus/arrivals?busStopCode=&serviceNo=` | Arrivals for a stop |

## Documentation

- [docs/LTA_API.md](docs/LTA_API.md) — LTA DataMall API reference
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — Code structure, UI guidelines

## App Store / Play Store deployment

```bash
cd mobile
npx eas build --platform all
```

Configure `app.json` / `eas.json` for your app identifiers and signing.