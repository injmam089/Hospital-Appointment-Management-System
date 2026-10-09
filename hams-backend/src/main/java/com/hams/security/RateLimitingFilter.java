package com.hams.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.URI;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * In-memory rate limiting filter protecting sensitive authentication endpoints
 * (/api/auth/login, /api/auth/register, /api/auth/refresh) against credential-stuffing
 * and brute-force denial of service attacks.
 */
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitingFilter.class);
    private static final long WINDOW_MS = 60_000L; // 1 minute sliding window

    private final int maxRequestsPerMinute;
    private final boolean enabled;
    private final ObjectMapper objectMapper;
    private final ConcurrentHashMap<String, RequestBucket> clientBuckets = new ConcurrentHashMap<>();

    public RateLimitingFilter(
            @Value("${hams.security.auth-rate-limit-per-minute:60}") int maxRequestsPerMinute,
            @Value("${hams.security.auth-rate-limit-enabled:true}") boolean enabled,
            ObjectMapper objectMapper
    ) {
        this.maxRequestsPerMinute = maxRequestsPerMinute;
        this.enabled = enabled;
        this.objectMapper = objectMapper;
    }

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        if (!enabled) {
            return true;
        }
        String path = request.getRequestURI();
        // Only enforce on auth submission endpoints
        return !(path.equals("/api/auth/login") ||
                 path.equals("/api/auth/register") ||
                 path.equals("/api/auth/refresh"));
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String clientIp = resolveClientIp(request);
        long now = System.currentTimeMillis();

        RequestBucket bucket = clientBuckets.compute(clientIp, (key, existing) -> {
            if (existing == null || (now - existing.windowStartMs) > WINDOW_MS) {
                return new RequestBucket(now, new AtomicInteger(1));
            }
            existing.count.incrementAndGet();
            return existing;
        });

        if (bucket.count.get() > maxRequestsPerMinute) {
            log.warn("Rate limit exceeded for IP: {} on {}", clientIp, request.getRequestURI());
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/problem+json");
            response.setHeader("Retry-After", "60");

            ProblemDetail detail = ProblemDetail.forStatusAndDetail(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Too many authentication attempts. Please wait and try again."
            );
            detail.setTitle("TOO_MANY_REQUESTS");
            detail.setType(URI.create("https://hams.example.com/errors/too_many_requests"));
            detail.setProperty("timestamp", Instant.now().toString());

            response.getWriter().write(objectMapper.writeValueAsString(detail));
            return;
        }

        // Periodic light cleanup when bucket map grows large
        if (clientBuckets.size() > 5000) {
            clientBuckets.entrySet().removeIf(entry -> (now - entry.getValue().windowStartMs) > WINDOW_MS);
        }

        filterChain.doFilter(request, response);
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "unknown";
    }

    private static class RequestBucket {
        final long windowStartMs;
        final AtomicInteger count;

        RequestBucket(long windowStartMs, AtomicInteger count) {
            this.windowStartMs = windowStartMs;
            this.count = count;
        }
    }
}
