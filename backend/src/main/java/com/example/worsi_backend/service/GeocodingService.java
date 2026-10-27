package com.example.worsi_backend.service;

import com.example.worsi_backend.Exception.BadRequestException;
import com.example.worsi_backend.Exception.GeocodingUnavailableException;
import com.example.worsi_backend.dto.GeocodeResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantLock;
import java.util.regex.Pattern;

/**
 * Turns text typed by a user (town, locality, address, PIN code) into verified coordinates using
 * OpenStreetMap Nominatim. It is called by the BACKEND only, so the browser never talks to Nominatim.
 *
 * Nominatim usage policy (https://operations.osmfoundation.org/policies/nominatim/), as implemented here:
 *  - at most 1 request per second  -> every upstream call goes through {@link #throttle} with a
 *    minimum spacing of app.geocoding.min-interval-ms (default 1100 ms);
 *  - a valid, identifying User-Agent -> app.geocoding.user-agent plus the contact e-mail;
 *  - results must be cached        -> in-memory cache keyed by the normalised query;
 *  - no auto-complete on every keystroke -> the frontend only searches when the user presses Search/Enter.
 * For heavy production traffic use a paid/self-hosted Nominatim (change app.geocoding.base-url).
 *
 * Nothing is invented: if the provider returns no usable coordinates the result list is empty.
 */
@Service
public class GeocodingService {

    private static final Logger log = LoggerFactory.getLogger(GeocodingService.class);

    private static final int MIN_QUERY_LENGTH = 3;
    private static final int MAX_QUERY_LENGTH = 200;
    /** A query made only of digits is treated as a postal / PIN code. */
    private static final Pattern POSTAL_CODE = Pattern.compile("^\\d{4,10}$");
    private static final Pattern HAS_LETTER_OR_DIGIT = Pattern.compile(".*[\\p{L}\\p{N}].*");
    /** How long a request may wait for its turn at the 1 req/s gate before we give up. */
    private static final long MAX_QUEUE_WAIT_SECONDS = 8;
    /** Empty answers are cached for a shorter time than real ones (typos get fixed quickly). */
    private static final Duration EMPTY_RESULT_TTL = Duration.ofMinutes(10);
    private static final int MAX_CACHE_ENTRIES = 2000;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final String baseUrl;
    private final String userAgent;
    private final String contactEmail;
    private final String countryCodes;
    private final Duration requestTimeout;
    private final long minIntervalNanos;
    private final Duration cacheTtl;
    private final int maxResults;

    private final ReentrantLock throttle = new ReentrantLock(true);
    /** Guarded by {@link #throttle}. 0 = no upstream call made yet. */
    private long lastUpstreamCallNanos = 0L;

    private final Map<String, CacheEntry> cache = new LinkedHashMap<>(64, 0.75f, true) {
        @Override
        protected boolean removeEldestEntry(Map.Entry<String, CacheEntry> eldest) {
            return size() > MAX_CACHE_ENTRIES;
        }
    };

    private record CacheEntry(List<GeocodeResult> results, long expiresAtNanos) {
    }

    public GeocodingService(ObjectMapper objectMapper,
                            @Value("${app.geocoding.base-url:https://nominatim.openstreetmap.org}") String baseUrl,
                            @Value("${app.geocoding.user-agent:Worksy/1.0}") String userAgent,
                            @Value("${app.geocoding.contact-email:}") String contactEmail,
                            @Value("${app.geocoding.country-codes:in}") String countryCodes,
                            @Value("${app.geocoding.timeout-ms:5000}") long timeoutMs,
                            @Value("${app.geocoding.min-interval-ms:1100}") long minIntervalMs,
                            @Value("${app.geocoding.cache-ttl-minutes:1440}") long cacheTtlMinutes,
                            @Value("${app.geocoding.max-results:5}") int maxResults) {
        this.objectMapper = objectMapper;
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        this.contactEmail = contactEmail == null ? "" : contactEmail.trim();
        String ua = (userAgent == null || userAgent.isBlank()) ? "Worksy/1.0" : userAgent.trim();
        this.userAgent = this.contactEmail.isEmpty() ? ua : ua + " (" + this.contactEmail + ")";
        this.countryCodes = countryCodes == null ? "" : countryCodes.trim().toLowerCase(Locale.ROOT);
        this.requestTimeout = Duration.ofMillis(Math.max(1000, timeoutMs));
        this.minIntervalNanos = TimeUnit.MILLISECONDS.toNanos(Math.max(0, minIntervalMs));
        this.cacheTtl = Duration.ofMinutes(Math.max(1, cacheTtlMinutes));
        this.maxResults = Math.min(10, Math.max(1, maxResults));
        this.httpClient = HttpClient.newBuilder().connectTimeout(this.requestTimeout).build();

        if (this.baseUrl.contains("nominatim.openstreetmap.org") && this.contactEmail.isEmpty()) {
            log.warn("app.geocoding.contact-email (GEOCODING_CONTACT_EMAIL) is not set. The public Nominatim "
                    + "service requires an identifying User-Agent/contact; set it before going to production.");
        }
    }

    /**
     * Resolves a place name / address / PIN code to up to {@code max-results} candidate places, best
     * match first. An empty list means the provider found nothing (the caller shows "location not found").
     *
     * @throws BadRequestException           blank / too short / too long / meaningless query
     * @throws GeocodingUnavailableException provider unreachable, rate-limited or returned garbage
     */
    public List<GeocodeResult> search(String rawQuery) {
        String query = normalise(rawQuery);
        if (query.length() < MIN_QUERY_LENGTH) {
            throw new BadRequestException("Enter at least " + MIN_QUERY_LENGTH + " characters of a place name or PIN code");
        }
        if (query.length() > MAX_QUERY_LENGTH) {
            throw new BadRequestException("Location text is too long (max " + MAX_QUERY_LENGTH + " characters)");
        }
        if (!HAS_LETTER_OR_DIGIT.matcher(query).matches()) {
            throw new BadRequestException("Enter a valid place name, address or PIN code");
        }

        String key = query.toLowerCase(Locale.ROOT) + "|" + countryCodes;
        List<GeocodeResult> cached = cacheGet(key);
        if (cached != null) {
            return cached;
        }
        return fetchFromProvider(query, key);
    }

    /* ----------------------------------------------------------------------------------------- */
    /* Upstream call (serialised + rate limited)                                                  */
    /* ----------------------------------------------------------------------------------------- */

    private List<GeocodeResult> fetchFromProvider(String query, String cacheKey) {
        boolean locked = false;
        try {
            locked = throttle.tryLock(MAX_QUEUE_WAIT_SECONDS, TimeUnit.SECONDS);
            if (!locked) {
                throw new GeocodingUnavailableException("Location search is busy right now. Please try again in a few seconds.");
            }
            // Another request for the same text may have filled the cache while we were queued.
            List<GeocodeResult> cached = cacheGet(cacheKey);
            if (cached != null) {
                return cached;
            }

            if (lastUpstreamCallNanos != 0L) {
                long waitNanos = minIntervalNanos - (System.nanoTime() - lastUpstreamCallNanos);
                if (waitNanos > 0) {
                    TimeUnit.NANOSECONDS.sleep(waitNanos);
                }
            }
            // Count the attempt even if it fails, so error storms cannot exceed the provider's rate limit.
            lastUpstreamCallNanos = System.nanoTime();

            HttpRequest request = HttpRequest.newBuilder(buildUri(query))
                    .timeout(requestTimeout)
                    .header("User-Agent", userAgent)
                    .header("Accept", "application/json")
                    .header("Accept-Language", "en")
                    .GET()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

            int status = response.statusCode();
            if (status == 429) {
                log.warn("Geocoding provider answered 429 (rate limited)");
                throw new GeocodingUnavailableException("Location search is busy right now. Please try again in a moment.");
            }
            if (status < 200 || status >= 300) {
                log.warn("Geocoding provider answered HTTP {}", status);
                throw new GeocodingUnavailableException("Location search is temporarily unavailable. Please try again shortly.");
            }

            List<GeocodeResult> results = parse(response.body());
            cachePut(cacheKey, results);
            return results;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new GeocodingUnavailableException("Location search was interrupted. Please try again.", e);
        } catch (IOException e) {
            // Timeouts, DNS failures, connection resets. Details are logged, never returned.
            log.warn("Geocoding request failed: {}", e.toString());
            throw new GeocodingUnavailableException("Could not reach the location service. Please try again shortly.", e);
        } finally {
            if (locked) {
                // Measure the gap from when the previous call FINISHED, so slow responses and connection
                // set-up can never make two requests land closer together than the configured interval.
                lastUpstreamCallNanos = System.nanoTime();
                throttle.unlock();
            }
        }
    }

    private URI buildUri(String query) {
        StringBuilder sb = new StringBuilder(baseUrl)
                .append("/search?format=jsonv2&addressdetails=1&accept-language=en&limit=").append(maxResults);
        if (POSTAL_CODE.matcher(query).matches()) {
            sb.append("&postalcode=").append(enc(query));
        } else {
            sb.append("&q=").append(enc(query));
        }
        if (!countryCodes.isEmpty()) {
            sb.append("&countrycodes=").append(enc(countryCodes));
        }
        if (!contactEmail.isEmpty()) {
            sb.append("&email=").append(enc(contactEmail));
        }
        return URI.create(sb.toString());
    }

    private static String enc(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }

    /* ----------------------------------------------------------------------------------------- */
    /* Response parsing                                                                           */
    /* ----------------------------------------------------------------------------------------- */

    @SuppressWarnings("unchecked")
    private List<GeocodeResult> parse(String body) {
        Object root;
        try {
            root = objectMapper.readValue(body, Object.class);
        } catch (RuntimeException e) {
            log.warn("Geocoding provider returned unparseable JSON: {}", e.toString());
            throw new GeocodingUnavailableException("Location service returned an unexpected answer. Please try again.", e);
        }
        if (!(root instanceof List<?> items)) {
            // Nominatim reports errors as a JSON object, e.g. {"error": {...}}
            log.warn("Geocoding provider returned a non-array body");
            throw new GeocodingUnavailableException("Location service returned an unexpected answer. Please try again.");
        }

        List<GeocodeResult> out = new ArrayList<>();
        Set<String> seen = new LinkedHashSet<>();
        for (Object item : items) {
            if (!(item instanceof Map<?, ?> raw)) {
                continue;
            }
            Map<String, Object> m = (Map<String, Object>) raw;
            Double lat = toDouble(m.get("lat"));
            Double lon = toDouble(m.get("lon"));
            // Never emit coordinates that are missing or out of range: skip the row instead of guessing.
            if (lat == null || lon == null || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
                continue;
            }
            String displayName = str(m.get("display_name"));
            if (displayName.isEmpty()) {
                continue;
            }
            String id = str(m.get("osm_type")) + ":" + str(m.get("osm_id"));
            if (id.length() <= 1) {
                id = "place:" + str(m.get("place_id"));
            }
            if (!seen.add(id)) {
                continue;
            }
            String type = str(m.get("type"));
            out.add(new GeocodeResult(
                    id,
                    buildLabel(m, displayName),
                    displayName,
                    round5(lat),
                    round5(lon),
                    type));
        }
        return List.copyOf(out);
    }

    /** "Madanapalle, Andhra Pradesh" / "Koramangala, Bengaluru, Karnataka" - short enough for a card or chip. */
    @SuppressWarnings("unchecked")
    private static String buildLabel(Map<String, Object> m, String displayName) {
        List<String> parts = new ArrayList<>();
        String name = str(m.get("name"));
        if (name.isEmpty()) {
            name = displayName.split(",")[0].trim();
        }
        addDistinct(parts, name);
        if (m.get("address") instanceof Map<?, ?> addrRaw) {
            Map<String, Object> addr = (Map<String, Object>) addrRaw;
            for (String field : new String[]{"city", "town", "village", "municipality", "county", "state_district"}) {
                String v = str(addr.get(field));
                if (!v.isEmpty()) {
                    addDistinct(parts, v);
                    break;
                }
            }
            addDistinct(parts, str(addr.get("state")));
        }
        return parts.isEmpty() ? displayName : String.join(", ", parts);
    }

    private static void addDistinct(List<String> parts, String value) {
        if (value == null || value.isBlank()) {
            return;
        }
        for (String p : parts) {
            if (p.equalsIgnoreCase(value)) {
                return;
            }
        }
        parts.add(value.trim());
    }

    private static String str(Object o) {
        return o == null ? "" : String.valueOf(o).trim();
    }

    private static Double toDouble(Object o) {
        if (o == null) {
            return null;
        }
        try {
            double d = o instanceof Number n ? n.doubleValue() : Double.parseDouble(String.valueOf(o).trim());
            return Double.isFinite(d) ? d : null;
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /** 5 decimals is about 1 m, far more precise than a town/locality search needs. */
    private static double round5(double v) {
        return Math.round(v * 100000.0) / 100000.0;
    }

    private static String normalise(String raw) {
        return raw == null ? "" : raw.trim().replaceAll("\\s+", " ");
    }

    /* ----------------------------------------------------------------------------------------- */
    /* Cache                                                                                      */
    /* ----------------------------------------------------------------------------------------- */

    private List<GeocodeResult> cacheGet(String key) {
        synchronized (cache) {
            CacheEntry e = cache.get(key);
            if (e == null) {
                return null;
            }
            if (System.nanoTime() - e.expiresAtNanos() >= 0) {
                cache.remove(key);
                return null;
            }
            return e.results();
        }
    }

    private void cachePut(String key, List<GeocodeResult> results) {
        Duration ttl = results.isEmpty() ? EMPTY_RESULT_TTL : cacheTtl;
        synchronized (cache) {
            cache.put(key, new CacheEntry(results, System.nanoTime() + ttl.toNanos()));
        }
    }
}
