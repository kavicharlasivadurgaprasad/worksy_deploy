package com.example.worsi_backend.Exception;

/** The storage backend failed. The message is safe to show; the cause (paths, SDK errors) is only logged. */
public class ImageStorageException extends RuntimeException {
    public ImageStorageException(String message, Throwable cause) {
        super(message, cause);
    }
}
