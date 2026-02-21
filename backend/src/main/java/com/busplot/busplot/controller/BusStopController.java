package com.busplot.busplot.controller;

import com.busplot.busplot.dto.BusStop;
import com.busplot.busplot.service.BusArrivalService;
import com.busplot.busplot.service.BusStopService;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class BusStopController {

    @Autowired
    private BusStopService busStopService;

    @Autowired
    private BusArrivalService busArrivalService;

    @GetMapping(path = "/bus/stops")
    public ResponseEntity<List<BusStop>> getAllBusStops() {
        return new ResponseEntity<>(busStopService.getAllBusStops(), HttpStatus.OK);
    }

    @GetMapping(path = "/bus/stops/nearby")
    public ResponseEntity<List<BusStop>> getNearbyBusStops(
            @RequestParam("lat") double lat,
            @RequestParam("lng") double lng,
            @RequestParam(value = "radiusKm", defaultValue = "3") double radiusKm
    ) {
        return new ResponseEntity<>(busStopService.getNearbyStops(lat, lng, radiusKm), HttpStatus.OK);
    }

    @GetMapping(path = "/bus/arrivals")
    public ResponseEntity<JsonNode> getBusArrivals(
            @RequestParam("busStopCode") String busStopCode,
            @RequestParam(value = "serviceNo", required = false) String serviceNo
    ) {
        return new ResponseEntity<>(busArrivalService.getArrivals(busStopCode, serviceNo), HttpStatus.OK);
    }
}
