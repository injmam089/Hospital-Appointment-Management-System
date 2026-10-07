package com.hams.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
@Tag(name = "Health", description = "Application health and status endpoints")
public class HealthController {

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Returns the current health status of the API")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "HAMS API",
            "version", "1.0.0",
            "timestamp", LocalDateTime.now().toString()
        ));
    }
}
