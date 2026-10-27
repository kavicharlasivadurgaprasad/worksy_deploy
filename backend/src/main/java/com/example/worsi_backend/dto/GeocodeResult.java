package com.example.worsi_backend.dto;

/**
 * One place returned by the location search. Coordinates come straight from the geocoding provider
 * (OpenStreetMap Nominatim); they are never guessed or filled in by Worksy.
 *
 * @param id          stable id of the place at the provider (e.g. "node:123"), used as a React key
 * @param label       short, human-friendly name, e.g. "Madanapalle, Andhra Pradesh"
 * @param displayName the provider's full address line, shown so similar names can be told apart
 * @param latitude    WGS84 latitude, -90..90
 * @param longitude   WGS84 longitude, -180..180
 * @param type        provider's place type (e.g. "town", "suburb", "postcode"), may be empty
 */
public record GeocodeResult(String id,
                            String label,
                            String displayName,
                            double latitude,
                            double longitude,
                            String type) {
}
