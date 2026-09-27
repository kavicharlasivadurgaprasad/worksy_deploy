package com.example.worsi_backend.dto;

import com.example.worsi_backend.Entity.Role;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/** One row in the current user's conversation list ("chat list") - one per person they've messaged. */
@Getter
@Setter
public class ConversationResponse {

    private Long otherUserId;
    private String otherUserName;
    private String otherUserAvatarUrl;
    private Role otherUserRole;
    private String otherUserPhone;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private boolean lastMessageMine;
    private long unreadCount;

    public ConversationResponse() {
    }
}
