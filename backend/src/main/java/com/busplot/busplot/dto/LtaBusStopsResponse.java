package com.busplot.busplot.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class LtaBusStopsResponse {
    @JsonProperty("value")
    private List<BusStop> value;
}
