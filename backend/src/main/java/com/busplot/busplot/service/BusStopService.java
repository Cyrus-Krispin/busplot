package com.busplot.busplot.service;

import com.busplot.busplot.config.DotenvLoader;
import com.busplot.busplot.config.MockFallbackData;
import com.busplot.busplot.dto.BusStop;
import com.busplot.busplot.dto.LtaBusStopsResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

@Service
public class BusStopService {

    private static final String BUS_STOPS_URL = "https://datamall2.mytransport.sg/ltaodataservice/BusStops";
    private static final double EARTH_RADIUS_KM = 6371;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String accountKey;

    private final AtomicReference<List<BusStop>> cache = new AtomicReference<>(null);

    public BusStopService() {
        Dotenv dotenv = DotenvLoader.load();
        String envKey = System.getenv("LTA_API_KEY");
        this.accountKey = (dotenv.get("LTA_API_KEY", envKey != null ? envKey : "")).trim();
    }

    public List<BusStop> getAllBusStops() {
        return fetchAndCacheStops();
    }

    private static final int MAX_NEARBY_STOPS = 20;

    public List<BusStop> getNearbyStops(double lat, double lng, double radiusKm) {
        List<BusStop> all = fetchAndCacheStops();
        return all.stream()
                .filter(s -> distanceKm(lat, lng, s.getLatitude(), s.getLongitude()) <= radiusKm)
                .sorted(Comparator.comparingDouble(s -> distanceKm(lat, lng, s.getLatitude(), s.getLongitude())))
                .limit(MAX_NEARBY_STOPS)
                .collect(Collectors.toList());
    }

    private List<BusStop> fetchAndCacheStops() {
        List<BusStop> cached = cache.get();
        if (cached != null) {
            return cached;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("AccountKey", accountKey);
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));

            HttpEntity<Void> request = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(BUS_STOPS_URL, HttpMethod.GET, request, String.class);

            LtaBusStopsResponse parsed = objectMapper.readValue(response.getBody(), LtaBusStopsResponse.class);
            List<BusStop> stops = parsed.getValue() != null ? parsed.getValue() : Collections.emptyList();
            cache.set(stops);
            return stops;
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() != 401) throw new RuntimeException("Failed to fetch Bus Stops", e);
            // LTA API key invalid/missing - use mock data so app works
            List<BusStop> mock = MockFallbackData.getMockStops();
            cache.set(mock);
            return mock;
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch Bus Stops", e);
        }
    }

    private static double distanceKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }
}
