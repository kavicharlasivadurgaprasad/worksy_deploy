package com.example.worsi_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Inbound payload for sending a chat message, used by both the REST endpoint and the
 * WebSocket handler. The sender is NEVER taken from this DTO - it always comes from the
 * authenticated principal (JWT for REST, handshake-validated session for WebSocket).
 * <p>
 * receiverId is only required over the WebSocket, where there is no URL path to carry it;
 * the REST endpoint takes the receiver from /conversations/{otherUserId}/messages instead.
 */
@Getter
@Setter
public class ChatMessageRequest {

    private Long receiverId;

    @NotBlank(message = "content must not be empty")
    @Size(max = 2000, message = "content must be at most 2000 characters")
    private String content;
}
