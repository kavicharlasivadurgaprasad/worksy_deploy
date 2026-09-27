package com.example.worsi_backend.dto;

import com.example.worsi_backend.Entity.ChatMessage;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ChatMessageResponse {

    private Long id;
    private Long senderId;
    private String senderName;
    private Long receiverId;
    private String receiverName;
    private String content;
    private LocalDateTime createdAt;
    private boolean read;
    /** Only set on messages pushed over the WebSocket, so the client can tell them apart from REST history. */
    private String type = "MESSAGE";

    public ChatMessageResponse() {
    }

    public ChatMessageResponse(ChatMessage m) {
        this.id = m.getId();
        this.senderId = m.getSender().getId();
        this.senderName = m.getSender().getName();
        this.receiverId = m.getReceiver().getId();
        this.receiverName = m.getReceiver().getName();
        this.content = m.getContent();
        this.createdAt = m.getCreatedAt();
        this.read = m.isRead();
    }
}
