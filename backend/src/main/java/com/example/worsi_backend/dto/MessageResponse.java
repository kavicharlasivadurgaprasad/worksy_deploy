package com.example.worsi_backend.dto;

import lombok.Getter;

/** Minimal { "message": "..." } body for endpoints that only need to say what happened. */
@Getter
public class MessageResponse {
    private final String message;

    public MessageResponse(String message) {
        this.message = message;
    }
}
