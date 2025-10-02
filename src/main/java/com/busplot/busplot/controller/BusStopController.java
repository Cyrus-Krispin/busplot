package com.busplot.busplot.controller;

import com.busplot.busplot.dto.BusStopInfo;
import com.busplot.busplot.service.BusStopService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class BusStopController {

    @Autowired
    private BusStopService busStopService;

    @GetMapping(path = "/busStop")
    public ResponseEntity<BusStopInfo> getBusStopInfo(String busStopId) {
        return new ResponseEntity<>(busStopService.getBusStopInfo(), HttpStatus.OK);
    }
}
