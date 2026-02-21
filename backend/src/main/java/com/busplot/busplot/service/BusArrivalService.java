package com.busplot.busplot.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.util.UriComponentsBuilder;

import com.busplot.busplot.config.DotenvLoader;
import com.busplot.busplot.config.MockFallbackData;

@Service
public class BusArrivalService {

	private static final String BUS_ARRIVAL_URL = "https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival";

	private final RestTemplate restTemplate = new RestTemplate();
	private final ObjectMapper objectMapper = new ObjectMapper();
	private final String accountKey;

	public BusArrivalService() {
		Dotenv dotenv = DotenvLoader.load();
		String envKey = System.getenv("LTA_API_KEY");
		this.accountKey = (dotenv.get("LTA_API_KEY", envKey != null ? envKey : "")).trim();
	}

	public JsonNode getArrivals(String busStopCode, String serviceNo) {
		try {
			String url = UriComponentsBuilder
				.fromHttpUrl(BUS_ARRIVAL_URL)
				.queryParam("BusStopCode", busStopCode)
				.queryParamIfPresent("ServiceNo", serviceNo == null || serviceNo.isBlank() ? java.util.Optional.empty() : java.util.Optional.of(serviceNo))
				.build(true)
				.toUriString();

			HttpHeaders headers = new HttpHeaders();
			headers.set("AccountKey", accountKey);
			headers.setAccept(java.util.List.of(MediaType.APPLICATION_JSON));

			HttpEntity<Void> request = new HttpEntity<>(headers);
			ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, request, String.class);
			return objectMapper.readTree(response.getBody());
		} catch (HttpClientErrorException e) {
			if (e.getStatusCode().value() != 401) throw new RuntimeException("Failed to fetch Bus Arrival", e);
			return MockFallbackData.getMockArrivals(busStopCode);
		} catch (Exception e) {
			throw new RuntimeException("Failed to fetch Bus Arrival", e);
		}
	}
}



