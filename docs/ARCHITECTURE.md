# Busplot architecture and coding guidelines

## Overview

Busplot is a bus arrival tracking app for Singapore. It shows your location on a map and lists nearby bus stops with live arrival times.

- **Mobile:** React Native (Expo), TypeScript
- **Backend:** Spring Boot (Java 17) — used later; frontend uses mock data for now

---

## Code structure

Logic is separated into dedicated files by concern:

```
mobile/src/
├── types/           # TypeScript types (bus.ts)
├── data/            # Mock data (mockBusStops.ts, mockArrivals.ts)
├── services/        # Data fetching (busService.ts, api.ts for backend)
├── hooks/           # React hooks (useLocation, useNearbyStops, useArrivals)
├── utils/           # Pure helpers (distance, arrival formatting)
├── theme/           # Colors and styling (colors.ts)
├── components/      # Reusable UI (BusStopCard)
└── screens/         # Screen-level components (MapScreen)
```

### Rules

- **Types** in `types/` — shared interfaces (BusStop, BusArrivalInfo, etc.)
- **Data** in `data/` — mock data only; matches LTA API shape for easy swap
- **Services** in `services/` — all data access; swap `busService.ts` to `api.ts` when backend is ready
- **Hooks** in `hooks/` — location, nearby stops, arrivals; no UI
- **Utils** in `utils/` — pure functions (distance, time formatting)
- **Components** in `components/` — reusable, presentational
- **Screens** in `screens/` — compose hooks + components

---

## Data flow

1. **Location** — `useLocation()` gets user coordinates (or Orchard fallback if denied/error)
2. **Nearby stops** — `useNearbyStops(location)` filters and sorts by distance (≤ 3 km). If user is >50 km from Singapore, uses Orchard as demo location so stops always show.
3. **Arrivals** — `useArrivals(busStopCode)` loads arrivals per stop (mock for now)

---

## Data flow

- **Backend:** Proxies LTA DataMall API (Bus Stops, Bus Arrival v3). Requires `LTA_API_KEY` in `backend/.env`.
- **Frontend:** `busService.ts` calls `api.ts` → backend endpoints. No mock data.

---

## UI guidelines

- **Theme:** Dark — black primary (`#000000`), white text, colored metrics
- **Arrival colors:** Green (< 5 min), amber (5–15 min), orange (15+ min)
- **Load indicators:** Green (seats), amber (standing), red (limited)
- **Map:** Dark style, user location, bus stop markers

---

## Singapore focus

- Mock stops use real Singapore bus stop codes and coordinates (Orchard, Marina, etc.)
- Distances in km; region centered on Singapore
