package com.example.worsi_backend.Controller;

import com.example.worsi_backend.dto.GeocodeResult;
import com.example.worsi_backend.service.GeocodingService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Location search used by the customer "Find available providers" box and the provider
 * "Service location" settings. Requires a JWT (SecurityConfig's anyRequest().authenticated()),
 * which also stops anonymous callers from using Worksy as a free proxy to the geocoding provider.
 */
@RestController
@RequestMapping("/api/v1/geocode")
public class GeocodeController {

    private final GeocodingService geocodingService;

    public GeocodeController(GeocodingService geocodingService) {
        this.geocodingService = geocodingService;
    }

    /**
     * GET /api/v1/geocode/search?q=Madanapalle, Andhra Pradesh
     * 200 + [] when nothing matches, 400 for a missing/invalid q, 503 when the geocoder is down.
     */
    @GetMapping("/search")
    public List<GeocodeResult> search(@RequestParam(name = "q", required = false) String q) {
        return geocodingService.search(q);
    }
}
