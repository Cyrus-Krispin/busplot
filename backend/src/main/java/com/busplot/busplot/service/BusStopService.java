package com.busplot.busplot.service;

import com.busplot.busplot.config.MockFallbackData;
import com.busplot.busplot.dto.BusStop;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

@Service
public class BusStopService {

    private static final double EARTH_RADIUS_KM = 6371;
    private static final int MAX_NEARBY_STOPS = 20;

    private final Resource busStopsResource;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final AtomicReference<List<BusStop>> cache = new AtomicReference<>(null);

    public BusStopService(@Value("${busplot.data.bus-stops-path}") Resource busStopsResource) {
        this.busStopsResource = busStopsResource;
    }

    public List<BusStop> getAllBusStops() {
        return loadAndCache();
    }

    public List<BusStop> searchBusStops(String query) {
        String q = query.toLowerCase(Locale.ROOT);
        return loadAndCache().stream()
                .filter(s -> s.getBusStopCode().toLowerCase(Locale.ROOT).contains(q)
                        || s.getDescription().toLowerCase(Locale.ROOT).contains(q)
                        || s.getRoadName().toLowerCase(Locale.ROOT).contains(q))
                .limit(50)
                .collect(Collectors.toList());
    }

    public List<BusStop> getNearbyStops(double lat, double lng, double radiusKm) {
        return loadAndCache().stream()
                .filter(s -> distanceKm(lat, lng, s.getLatitude(), s.getLongitude()) <= radiusKm)
                .sorted(Comparator.comparingDouble(s -> distanceKm(lat, lng, s.getLatitude(), s.getLongitude())))
                .limit(MAX_NEARBY_STOPS)
                .collect(Collectors.toList());
    }

    private List<BusStop> loadAndCache() {
        List<BusStop> cached = cache.get();
        if (cached != null) return cached;

        try {
            List<BusStop> stops = objectMapper.readValue(
                    busStopsResource.getInputStream(),
                    new TypeReference<List<BusStop>>() {}
            );
            cache.set(stops);
            return stops;
        } catch (Exception e) {
            List<BusStop> mock = MockFallbackData.getMockStops();
            cache.set(mock);
            return mock;
        }
    }

    private static double distanceKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
