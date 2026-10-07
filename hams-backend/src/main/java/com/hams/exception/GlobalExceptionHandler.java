package com.hams.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(HamsException.class)
    public ResponseEntity<ProblemDetail> handleHamsException(HamsException ex) {
        log.warn("HAMS Exception: [{}] {}", ex.getCode(), ex.getMessage());
        ProblemDetail detail = ProblemDetail.forStatusAndDetail(ex.getStatus(), ex.getMessage());
        detail.setTitle(ex.getCode());
        detail.setType(URI.create("https://hams.example.com/errors/" + ex.getCode().toLowerCase()));
        detail.setProperty("timestamp", Instant.now().toString());
        return ResponseEntity.status(ex.getStatus()).body(detail);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ProblemDetail> handleAccessDeniedException(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        ProblemDetail detail = ProblemDetail.forStatusAndDetail(
            HttpStatus.FORBIDDEN,
            "Access denied. You do not have sufficient permissions to access this healthcare resource."
        );
        detail.setTitle("FORBIDDEN");
        detail.setType(URI.create("https://hams.example.com/errors/forbidden"));
        detail.setProperty("timestamp", Instant.now().toString());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(detail);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ProblemDetail> handleAuthenticationException(AuthenticationException ex) {
        log.warn("Authentication failed: {}", ex.getMessage());
        ProblemDetail detail = ProblemDetail.forStatusAndDetail(
            HttpStatus.UNAUTHORIZED,
            "Authentication required. Please provide valid bearer token credentials."
        );
        detail.setTitle("UNAUTHORIZED");
        detail.setType(URI.create("https://hams.example.com/errors/unauthorized"));
        detail.setProperty("timestamp", Instant.now().toString());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(detail);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ProblemDetail> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        log.warn("Database integrity violation: {}", ex.getMessage());
        String msg = ex.getMessage() != null ? ex.getMessage().toLowerCase() : "";
        String userMessage;
        if (msg.contains("idx_appt_unique_slot") || msg.contains("appointment")) {
            userMessage = "The selected appointment slot has already been booked. Please choose another time.";
        } else {
            userMessage = "A database integrity constraint was violated. A conflicting resource may already exist.";
        }
        ProblemDetail detail = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, userMessage);
        detail.setTitle("CONFLICT");
        detail.setType(URI.create("https://hams.example.com/errors/conflict"));
        detail.setProperty("timestamp", Instant.now().toString());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(detail);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String field = error instanceof FieldError fe ? fe.getField() : error.getObjectName();
            errors.put(field, error.getDefaultMessage());
        });
        ProblemDetail detail = ProblemDetail.forStatusAndDetail(
            HttpStatus.UNPROCESSABLE_ENTITY,
            "Input validation failed. Please check the errors and try again."
        );
        detail.setTitle("VALIDATION_ERROR");
        detail.setProperty("errors", errors);
        detail.setProperty("timestamp", Instant.now().toString());
        return ResponseEntity.unprocessableEntity().body(detail);
    }

    @ExceptionHandler({
        org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class,
        org.springframework.http.converter.HttpMessageNotReadableException.class,
        IllegalArgumentException.class
    })
    public ResponseEntity<ProblemDetail> handleBadRequestExceptions(Exception ex) {
        log.warn("Bad request parameter or payload: {}", ex.getMessage());
        ProblemDetail detail = ProblemDetail.forStatusAndDetail(
            HttpStatus.BAD_REQUEST,
            "Malformed request parameter, date format, or unreadable payload. Please verify your input."
        );
        detail.setTitle("BAD_REQUEST");
        detail.setType(URI.create("https://hams.example.com/errors/bad_request"));
        detail.setProperty("timestamp", Instant.now().toString());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(detail);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetail> handleGenericException(Exception ex) {
        log.error("Unexpected error", ex);
        ProblemDetail detail = ProblemDetail.forStatusAndDetail(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "An unexpected error occurred. Please try again or contact support."
        );
        detail.setTitle("INTERNAL_SERVER_ERROR");
        detail.setProperty("timestamp", Instant.now().toString());
        return ResponseEntity.internalServerError().body(detail);
    }
}
