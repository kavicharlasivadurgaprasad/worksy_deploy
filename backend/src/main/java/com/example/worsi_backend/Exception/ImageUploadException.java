package com.example.worsi_backend.Exception;

import org.springframework.http.HttpStatus;

/** A rejected image upload (wrong type, too big, too many, corrupt). Carries the HTTP status to return. */
public class ImageUploadException extends RuntimeException {

    private final HttpStatus status;

    public ImageUploadException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
