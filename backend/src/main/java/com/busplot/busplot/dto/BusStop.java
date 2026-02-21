package com.busplot.busplot.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BusStop {
    @JsonProperty("BusStopCode")
    private String busStopCode;

    @JsonProperty("RoadName")
    private String roadName;

    @JsonProperty("Description")
    private String description;

    @JsonProperty("Latitude")
    private double latitude;

    @JsonProperty("Longitude")
    private double longitude;
}
