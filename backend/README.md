# Busplot Backend

Spring Boot REST API that proxies LTA DataMall bus data.

## Setup

```bash
cp .env.example .env
# Edit .env and add your LTA_API_KEY from https://datamall.lta.gov.sg/
```

## Run

```bash
./mvnw spring-boot:run
```

## Endpoints

- `GET /busStop` — Bus stop info
- `GET /bus/arrivals?busStopCode=12345&serviceNo=10` — Arrivals for a stop
