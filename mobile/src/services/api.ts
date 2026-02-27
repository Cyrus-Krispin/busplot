/**
 * API client for the Busplot backend.
 * Backend must be running with LTA_API_KEY in backend/.env
 *
 * For physical device: edit src/config.ts to use your computer's IP.
 */
import { getApiBaseUrl } from '../config';

const BASE_URL = getApiBaseUrl();
const FETCH_TIMEOUT_MS = 10_000;

async function fetchWithTimeout(url: string, options?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timeout);
  }
}

export type BusStop = {
  BusStopCode: string;
  RoadName: string;
  Description: string;
  Latitude: number;
  Longitude: number;
};

export type BusArrivalInfo = {
  OriginCode?: string;
  DestinationCode?: string;
  EstimatedArrival: string;
  Monitored?: number;
  Latitude?: string;
  Longitude?: string;
  VisitNumber?: string;
  Load: 'SEA' | 'SDA' | 'LSD';
  Feature: string;
  Type?: string;
};

export type BusServiceArrival = {
  ServiceNo: string;
  Operator: string;
  NextBus: BusArrivalInfo;
  NextBus2: BusArrivalInfo;
  NextBus3: BusArrivalInfo;
};

export type BusArrivalResponse = {
  'odata.metadata'?: string;
  BusStopCode: string;
  Services: BusServiceArrival[];
};

export async function getBusStops(): Promise<BusStop[]> {
  const res = await fetchWithTimeout(`${BASE_URL}/bus/stops`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : data.value ?? [];
}

export async function getNearbyBusStops(
  lat: number,
  lng: number,
  radiusKm = 3
): Promise<BusStop[]> {
  const params = new URLSearchParams({ lat: String(lat), lng: String(lng), radiusKm: String(radiusKm) });
  const res = await fetchWithTimeout(`${BASE_URL}/bus/stops/nearby?${params}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function searchBusStops(query: string): Promise<BusStop[]> {
  const params = new URLSearchParams({ q: query });
  const res = await fetchWithTimeout(`${BASE_URL}/bus/stops/search?${params}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function getBusArrivals(
  busStopCode: string,
  serviceNo?: string
): Promise<BusArrivalResponse> {
  const params = new URLSearchParams({ busStopCode });
  if (serviceNo) params.set('serviceNo', serviceNo);
  const res = await fetchWithTimeout(`${BASE_URL}/bus/arrivals?${params}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
