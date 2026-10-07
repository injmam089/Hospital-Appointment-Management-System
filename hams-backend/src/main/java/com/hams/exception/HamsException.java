package com.hams.exception;

import org.springframework.http.HttpStatus;

public class HamsException extends RuntimeException {

    private final HttpStatus status;
    private final String code;

    public HamsException(String message, HttpStatus status, String code) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public HamsException(String message, HttpStatus status) {
        this(message, status, status.name());
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getCode() {
        return code;
    }

    public static HamsException notFound(String entity, Object id) {
        return new HamsException(
            entity + " not found with id: " + id,
            HttpStatus.NOT_FOUND,
            "RESOURCE_NOT_FOUND"
        );
    }

    public static HamsException conflict(String message) {
        return new HamsException(message, HttpStatus.CONFLICT, "CONFLICT");
    }

    public static HamsException forbidden(String message) {
        return new HamsException(message, HttpStatus.FORBIDDEN, "FORBIDDEN");
    }

    public static HamsException badRequest(String message) {
        return new HamsException(message, HttpStatus.BAD_REQUEST, "BAD_REQUEST");
    }
}
