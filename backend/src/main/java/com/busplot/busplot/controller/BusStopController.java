package com.busplot.busplot.controller;

import com.busplot.busplot.dto.BusStop;
import com.busplot.busplot.service.BusArrivalService;
import com.busplot.busplot.service.BusStopService;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class BusStopController {

    private static final Logger log = LoggerFactory.getLogger(BusStopController.class);

    @Autowired
    private BusStopService busStopService;

    @Autowired
    private BusArrivalService busArrivalService;

    @GetMapping(path = "/bus/stops")
    public ResponseEntity<List<BusStop>> getAllBusStops() {
        log.info("API GET /bus/stops");
        long start = System.currentTimeMillis();
        try {
            List<BusStop> stops = busStopService.getAllBusStops();
            log.info("API GET /bus/stops OK count={} ms={}", stops.size(), System.currentTimeMillis() - start);
            return new ResponseEntity<>(stops, HttpStatus.OK);
        } catch (Exception e) {
            log.error("API GET /bus/stops FAILED ms={}", System.currentTimeMillis() - start, e);
            throw e;
        }
    }

    @GetMapping(path = "/bus/stops/nearby")
    public ResponseEntity<List<BusStop>> getNearbyBusStops(
            @RequestParam("lat") double lat,
            @RequestParam("lng") double lng,
            @RequestParam(value = "radiusKm", defaultValue = "3") double radiusKm
    ) {
        log.info("API GET /bus/stops/nearby lat={} lng={} radiusKm={}", lat, lng, radiusKm);
        long start = System.currentTimeMillis();
        try {
            List<BusStop> stops = busStopService.getNearbyStops(lat, lng, radiusKm);
            log.info("API GET /bus/stops/nearby OK count={} ms={}", stops.size(), System.currentTimeMillis() - start);
            return new ResponseEntity<>(stops, HttpStatus.OK);
        } catch (Exception e) {
            log.error("API GET /bus/stops/nearby FAILED lat={} lng={} ms={}", lat, lng, System.currentTimeMillis() - start, e);
            throw e;
        }
    }

    @GetMapping(path = "/bus/stops/search")
    public ResponseEntity<List<BusStop>> searchBusStops(
            @RequestParam("q") String query
    ) {
        if (query == null || query.isBlank()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        log.info("API GET /bus/stops/search q={}", query);
        long start = System.currentTimeMillis();
        try {
            List<BusStop> stops = busStopService.searchBusStops(query);
            log.info("API GET /bus/stops/search OK count={} ms={}", stops.size(), System.currentTimeMillis() - start);
            return new ResponseEntity<>(stops, HttpStatus.OK);
        } catch (Exception e) {
            log.error("API GET /bus/stops/search FAILED q={} ms={}", query, System.currentTimeMillis() - start, e);
            throw e;
        }
    }

    @GetMapping(path = "/bus/arrivals")
    public ResponseEntity<JsonNode> getBusArrivals(
            @RequestParam("busStopCode") String busStopCode,
            @RequestParam(value = "serviceNo", required = false) String serviceNo
    ) {
        log.info("API GET /bus/arrivals busStopCode={} serviceNo={}", busStopCode, serviceNo);
        long start = System.currentTimeMillis();
        try {
            JsonNode result = busArrivalService.getArrivals(busStopCode, serviceNo);
            log.info("API GET /bus/arrivals OK busStopCode={} ms={}", busStopCode, System.currentTimeMillis() - start);
            return new ResponseEntity<>(result, HttpStatus.OK);
        } catch (Exception e) {
            log.error("API GET /bus/arrivals FAILED busStopCode={} ms={}", busStopCode, System.currentTimeMillis() - start, e);
            throw e;
        }
    }
}
