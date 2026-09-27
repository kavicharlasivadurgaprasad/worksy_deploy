package com.example.worsi_backend.websocket;

import com.example.worsi_backend.Exception.BadRequestException;
import com.example.worsi_backend.Exception.ResourceNotFoundException;
import com.example.worsi_backend.dto.ChatMessageRequest;
import com.example.worsi_backend.service.ChatService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;

/**
 * One WebSocket connection per browser tab, at /ws/chat. Protocol is deliberately simple JSON
 * (no STOMP/SockJS) since the app only needs "send a chat message" / "receive a chat message" -
 * a raw handler avoids pulling sockjs-client / @stomp/stompjs into the frontend and needs no
 * broker configuration, while still giving true real-time, bidirectional delivery over one
 * persistent connection per session, with clean connect/disconnect lifecycle hooks below.
 * <p>
 * Inbound frame (client -> server):  {"receiverId": 5, "content": "hello"}
 * Outbound frame (server -> client): a ChatMessageResponse JSON object, or
 *                                    {"type": "ERROR", "message": "..."} on failure.
 * The connection never trusts a sender id supplied by the client: it is fixed for the lifetime
 * of the session to the user id resolved by JwtHandshakeInterceptor at handshake time.
 */
@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(ChatWebSocketHandler.class);

    private final ChatService chatService;
    private final ChatSessionRegistry sessionRegistry;
    private final ObjectMapper objectMapper;

    public ChatWebSocketHandler(ChatService chatService,
                                 ChatSessionRegistry sessionRegistry,
                                 ObjectMapper objectMapper) {
        this.chatService = chatService;
        this.sessionRegistry = sessionRegistry;
        this.objectMapper = objectMapper;
    }

    private Long currentUserId(WebSocketSession session) {
        return (Long) session.getAttributes().get(JwtHandshakeInterceptor.USER_ID_ATTRIBUTE);
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        Long userId = currentUserId(session);
        if (userId == null) {
            closeQuietly(session);
            return;
        }
        sessionRegistry.register(userId, session);
        log.debug("Chat WebSocket connected for user {}", userId);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        Long senderId = currentUserId(session);
        if (senderId == null) {
            closeQuietly(session);
            return;
        }

        try {
            ChatMessageRequest request = objectMapper.readValue(message.getPayload(), ChatMessageRequest.class);

            if (request.getReceiverId() == null) {
                sendError(session, "receiverId is required");
                return;
            }

            chatService.sendMessage(senderId, request.getReceiverId(), request.getContent());
            // No separate ack frame is sent here: sendMessage() already pushes the saved message
            // back to every open session of the sender (this tab included) and to the receiver.

        } catch (BadRequestException | ResourceNotFoundException e) {
            sendError(session, e.getMessage());
        } catch (Exception e) {
            log.warn("Malformed chat WebSocket frame from user {}: {}", senderId, e.getMessage());
            sendError(session, "Malformed message payload");
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        Long userId = currentUserId(session);
        if (userId != null) {
            sessionRegistry.unregister(userId, session);
            log.debug("Chat WebSocket disconnected for user {} ({})", userId, status);
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        log.warn("Chat WebSocket transport error: {}", exception.getMessage());
        Long userId = currentUserId(session);
        if (userId != null) {
            sessionRegistry.unregister(userId, session);
        }
    }

    private void sendError(WebSocketSession session, String message) {
        try {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(
                        objectMapper.writeValueAsString(Map.of("type", "ERROR", "message", message))));
            }
        } catch (Exception e) {
            log.warn("Failed to send chat error frame: {}", e.getMessage());
        }
    }

    /** Closes a session that never authenticated (no user id resolved). Always the same reason. */
    private void closeQuietly(WebSocketSession session) {
        try {
            session.close(CloseStatus.NOT_ACCEPTABLE);
        } catch (Exception ignored) {
            // connection already gone
        }
    }
}
