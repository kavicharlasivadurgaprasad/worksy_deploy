package com.example.worsi_backend.websocket;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 * Keeps track of which users currently have an open chat WebSocket connection, possibly across
 * several open tabs/devices at once, and lets the rest of the app push a JSON payload straight
 * to a user's browser(s) without the sender and receiver needing to be in the same request.
 */
@Component
public class ChatSessionRegistry {

    private static final Logger log = LoggerFactory.getLogger(ChatSessionRegistry.class);

    private final ConcurrentHashMap<Long, Set<WebSocketSession>> sessionsByUserId = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    public ChatSessionRegistry(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public void register(Long userId, WebSocketSession session) {
        sessionsByUserId.computeIfAbsent(userId, id -> new CopyOnWriteArraySet<>()).add(session);
    }

    public void unregister(Long userId, WebSocketSession session) {
        Set<WebSocketSession> sessions = sessionsByUserId.get(userId);
        if (sessions == null) return;
        sessions.remove(session);
        if (sessions.isEmpty()) {
            sessionsByUserId.remove(userId, sessions);
        }
    }

    public boolean isOnline(Long userId) {
        Set<WebSocketSession> sessions = sessionsByUserId.get(userId);
        return sessions != null && !sessions.isEmpty();
    }

    /** Best-effort push to every open session of a user (all their tabs/devices). Never throws. */
    public void sendToUser(Long userId, Object payload) {
        Set<WebSocketSession> sessions = sessionsByUserId.get(userId);
        if (sessions == null || sessions.isEmpty()) return;

        String json;
        try {
            json = objectMapper.writeValueAsString(payload);
        } catch (Exception e) {
            log.warn("Failed to serialize chat payload for user {}: {}", userId, e.getMessage());
            return;
        }

        for (WebSocketSession session : sessions) {
            try {
                if (session.isOpen()) {
                    session.sendMessage(new TextMessage(json));
                }
            } catch (IOException e) {
                log.warn("Failed to deliver chat message to a session of user {}: {}", userId, e.getMessage());
            }
        }
    }
}
