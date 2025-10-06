package com.busplot.busplot.service;

import com.busplot.busplot.dto.BusStopInfo;
import org.springframework.stereotype.Service;

@Service
public class BusStopService {
    public BusStopInfo getBusStopInfo() {
        return BusStopInfo.builder().busStopId("123").build();
    }
}
