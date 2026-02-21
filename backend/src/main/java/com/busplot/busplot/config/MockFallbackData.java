package com.busplot.busplot.config;

import com.busplot.busplot.dto.BusStop;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;

/**
 * Mock data used when LTA API returns 401 (invalid/missing API key).
 * Allows the app to work while the user fixes their LTA_API_KEY.
 */
public final class MockFallbackData {

    private static final List<BusStop> MOCK_STOPS = List.of(
            new BusStop("43241", "Orchard Blvd", "Opp Orchard Stn", 1.3042, 103.8321),
            new BusStop("43331", "Orchard Rd", "Orchard Stn", 1.3048, 103.8314),
            new BusStop("44069", "Marina Blvd", "Marina Bay Financial Ctr", 1.2794, 103.8512),
            new BusStop("03111", "Orchard Rd", "Dhoby Ghaut Stn", 1.2990, 103.8455),
            new BusStop("01019", "North Bridge Rd", "Raffles Hotel", 1.2945, 103.8542),
            new BusStop("04111", "Somerset Rd", "Somerset Stn", 1.3002, 103.8388)
    );

    public static List<BusStop> getMockStops() {
        return MOCK_STOPS;
    }

    public static JsonNode getMockArrivals(String busStopCode) {
        String t = java.time.ZonedDateTime.now(java.time.ZoneId.of("Asia/Singapore")).plusMinutes(2).format(java.time.format.DateTimeFormatter.ISO_OFFSET_DATE_TIME);
        String json = String.format("""
            {"BusStopCode":"%s","Services":[
              {"ServiceNo":"7","Operator":"SBST","NextBus":{"EstimatedArrival":"%s","Load":"SEA","Feature":"WAB"},"NextBus2":{"EstimatedArrival":"%s","Load":"SDA","Feature":""},"NextBus3":{"EstimatedArrival":"%s","Load":"LSD","Feature":""}},
              {"ServiceNo":"14","Operator":"SBST","NextBus":{"EstimatedArrival":"%s","Load":"SEA","Feature":"WAB"},"NextBus2":{"EstimatedArrival":"%s","Load":"SEA","Feature":""},"NextBus3":{"EstimatedArrival":"%s","Load":"SDA","Feature":""}}
            ]}
            """, busStopCode, t, t, t, t, t, t);
        try {
            return new ObjectMapper().readTree(json);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
