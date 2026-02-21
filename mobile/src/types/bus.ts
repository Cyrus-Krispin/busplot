/**
 * Bus stop and arrival types.
 * Matches LTA DataMall API structure for easy backend swap later.
 */
export type BusStop = {
  BusStopCode: string;
  RoadName: string;
  Description: string;
  Latitude: number;
  Longitude: number;
};

export type BusArrivalInfo = {
  EstimatedArrival: string; // ISO 8601
  Load: 'SEA' | 'SDA' | 'LSD'; // Seat available, Standing, Limited
  Feature: 'WAB' | ''; // Wheelchair accessible
};

export type BusServiceArrival = {
  ServiceNo: string;
  Operator: string;
  NextBus: BusArrivalInfo;
  NextBus2: BusArrivalInfo;
  NextBus3: BusArrivalInfo;
};

export type BusArrivalResponse = {
  'odata.metadata': string;
  BusStopCode: string;
  Services: BusServiceArrival[];
};
