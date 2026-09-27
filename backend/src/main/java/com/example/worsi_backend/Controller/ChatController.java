package com.example.worsi_backend.Controller;

import com.example.worsi_backend.dto.ChatMessageRequest;
import com.example.worsi_backend.dto.ChatMessageResponse;
import com.example.worsi_backend.dto.ConversationResponse;
import com.example.worsi_backend.security.SecurityUtil;
import com.example.worsi_backend.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST surface for chat. This is the source of truth for conversation history (so refreshing the
 * page never loses messages) and also acts as a fallback for sending a message if the WebSocket
 * connection is temporarily down. Every endpoint requires a valid JWT (enforced by SecurityConfig,
 * since only /api/v1/auth/** and the public catalog GETs are permitted without one); the current
 * user is always read from the token via SecurityUtil, never trusted from the request body/path.
 */
@RestController
@RequestMapping("/api/v1/chat")
@CrossOrigin(origins = "http://localhost:3000")
public class ChatController {

    private final ChatService chatService;
    private final SecurityUtil securityUtil;

    public ChatController(ChatService chatService, SecurityUtil securityUtil) {
        this.chatService = chatService;
        this.securityUtil = securityUtil;
    }

    /** The chat list: one row per person the current user has an existing conversation with. */
    @GetMapping("/conversations")
    public List<ConversationResponse> getConversations() {
        return chatService.getConversations(securityUtil.getCurrentUserId());
    }

    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount() {
        return Map.of("unreadCount", chatService.getTotalUnreadCount(securityUtil.getCurrentUserId()));
    }

    /** Full message history with one other user. A user can only ever fetch their own conversations. */
    @GetMapping("/conversations/{otherUserId}/messages")
    public List<ChatMessageResponse> getMessages(@PathVariable Long otherUserId) {
        return chatService.getConversation(securityUtil.getCurrentUserId(), otherUserId);
    }

    /** REST fallback for sending a message (used when the WebSocket is unavailable). */
    @PostMapping("/conversations/{otherUserId}/messages")
    public ResponseEntity<ChatMessageResponse> sendMessage(@PathVariable Long otherUserId,
                                                            @Valid @RequestBody ChatMessageRequest request) {
        ChatMessageResponse response = chatService.sendMessage(
                securityUtil.getCurrentUserId(), otherUserId, request.getContent());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/conversations/{otherUserId}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long otherUserId) {
        chatService.markConversationRead(securityUtil.getCurrentUserId(), otherUserId);
        return ResponseEntity.noContent().build();
    }
}
