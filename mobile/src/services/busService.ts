/**
 * Bus data service - uses backend API.
 */
import * as api from './api';
import type { BusStop, BusServiceArrival } from '../types/bus';

export async function getBusStops(): Promise<BusStop[]> {
  return api.getBusStops();
}

export async function getNearbyBusStops(lat: number, lng: number, radiusKm = 3): Promise<BusStop[]> {
  return api.getNearbyBusStops(lat, lng, radiusKm);
}

export async function getArrivalsForStop(busStopCode: string): Promise<BusServiceArrival[]> {
  const res = await api.getBusArrivals(busStopCode);
  if (!res?.Services?.length) return [];
  return res.Services.map((s) => ({
    ServiceNo: s.ServiceNo,
    Operator: s.Operator,
    NextBus: normalizeArrival(s.NextBus),
    NextBus2: normalizeArrival(s.NextBus2),
    NextBus3: normalizeArrival(s.NextBus3),
  }));
}

function normalizeArrival(bus: { EstimatedArrival?: string; Load?: string; Feature?: string }): {
  EstimatedArrival: string;
  Load: 'SEA' | 'SDA' | 'LSD';
  Feature: 'WAB' | '';
} {
  const load = (bus?.Load === 'SEA' || bus?.Load === 'SDA' || bus?.Load === 'LSD' ? bus.Load : 'SEA') as 'SEA' | 'SDA' | 'LSD';
  const feature = bus?.Feature === 'WAB' ? 'WAB' : '';
  return {
    EstimatedArrival: bus?.EstimatedArrival ?? '',
    Load: load,
    Feature: feature,
  };
}
