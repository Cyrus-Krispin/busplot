# LTA DataMall API Reference

Busplot uses the LTA DataMall APIs. All requests require an `AccountKey` header. Get your key at [datamall.lta.gov.sg](https://datamall.lta.gov.sg/).

---

## 2.1 Bus Arrival

**URL:** `https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival`  
**Update Freq:** 20 seconds

Returns real-time bus arrival information at a bus stop.

### Request

| Parameter    | Description              | Mandatory | Example |
|-------------|--------------------------|-----------|---------|
| BusStopCode | Bus stop reference code  | Yes       | 83139   |
| ServiceNo   | Bus service number       | No        | 15      |

### Response

| Attribute      | Description |
|----------------|-------------|
| ServiceNo      | Bus service number |
| Operator       | SBST, SMRT, TTS, GAS |
| NextBus, NextBus2, NextBus3 | Next 3 oncoming buses |

**NextBus attributes:**

| Attribute        | Description |
|------------------|-------------|
| OriginCode       | First bus stop of service |
| DestinationCode  | Last bus stop of service |
| EstimatedArrival | ISO 8601 (GMT+8) |
| Monitored        | 0 = schedule, 1 = estimated from location |
| Latitude, Longitude | Current bus location |
| VisitNumber      | 1 = 1st visit, 2 = 2nd visit |
| Load             | SEA (Seats), SDA (Standing), LSD (Limited) |
| Feature          | WAB = wheelchair accessible |
| Type             | SD, DD, BD |

### Advisement Messages

When no arrival data: show "No Est. Available" or "Not In Operation".

### Rounding

Round derived duration **down** to nearest minute:
- 3:49 → "3 min"
- 0:59 → "Arr"

### Load Colour Scheme

- **Green** – Seats Available
- **Amber** – Standing Available
- **Red** – Limited Standing

---

## 2.2 Bus Services

**URL:** `https://datamall2.mytransport.sg/ltaodataservice/BusServices`  
**Update Freq:** Ad hoc

Returns service info: first/last stop, peak/offpeak frequency.

---

## 2.3 Bus Routes

**URL:** `https://datamall2.mytransport.sg/ltaodataservice/BusRoutes`  
**Update Freq:** Ad hoc

Returns route info: all stops per service, first/last bus timings.

---

## 2.4 Bus Stops

**URL:** `https://datamall2.mytransport.sg/ltaodataservice/BusStops`  
**Update Freq:** Ad hoc

Returns all bus stops with coordinates. Uses OData pagination: append `?$skip=N&$top=500` to fetch pages (~5,300 total stops).

### Response

| Attribute   | Description | Sample |
|-------------|-------------|--------|
| BusStopCode | 5-digit ID  | 01012  |
| RoadName    | Road name   | Victoria St |
| Description | Landmark    | Hotel Grand Pacific |
| Latitude    | Coordinate  | 1.29685 |
| Longitude   | Coordinate  | 103.853 |

---

## Loop Services

Some loop services use G/W suffix: 225G, 225W, 243G, 243W, 410G, 410W. Display each direction separately.
