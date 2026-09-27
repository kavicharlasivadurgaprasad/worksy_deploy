package com.example.worsi_backend.service;

import com.example.worsi_backend.Entity.ChatMessage;
import com.example.worsi_backend.Entity.User;
import com.example.worsi_backend.Exception.BadRequestException;
import com.example.worsi_backend.Exception.ResourceNotFoundException;
import com.example.worsi_backend.dto.ChatMessageResponse;
import com.example.worsi_backend.dto.ConversationResponse;
import com.example.worsi_backend.repository.ChatMessageRepository;
import com.example.worsi_backend.repository.UserRepository;
import com.example.worsi_backend.websocket.ChatSessionRegistry;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@Transactional
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final ChatSessionRegistry sessionRegistry;

    public ChatService(ChatMessageRepository chatMessageRepository,
                        UserRepository userRepository,
                        ChatSessionRegistry sessionRegistry) {
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
        this.sessionRegistry = sessionRegistry;
    }

    /**
     * Persists a message and pushes it in real time to the receiver (and to the sender's other
     * open tabs, so every device stays in sync) if they currently have a live connection.
     * The sender id is always the authenticated user - callers must never accept it from the client.
     */
    public ChatMessageResponse sendMessage(Long senderId, Long receiverId, String content) {
        if (content == null || content.isBlank()) {
            throw new BadRequestException("Message content must not be empty");
        }
        if (senderId.equals(receiverId)) {
            throw new BadRequestException("You cannot send a message to yourself");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + senderId));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipient not found with id: " + receiverId));

        ChatMessage message = new ChatMessage();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(content.trim());
        message.setCreatedAt(LocalDateTime.now());
        message.setRead(false);

        ChatMessage saved = chatMessageRepository.save(message);
        ChatMessageResponse response = new ChatMessageResponse(saved);

        // Real-time delivery: push to the receiver if they're online, and echo to the sender's
        // other open tabs so multiple devices for the same account stay in sync.
        sessionRegistry.sendToUser(receiverId, response);
        sessionRegistry.sendToUser(senderId, response);

        return response;
    }

    public List<ChatMessageResponse> getConversation(Long currentUserId, Long otherUserId) {
        if (!userRepository.existsById(otherUserId)) {
            throw new ResourceNotFoundException("User not found with id: " + otherUserId);
        }
        return chatMessageRepository.findConversation(currentUserId, otherUserId).stream()
                .map(ChatMessageResponse::new)
                .toList();
    }

    /** Marks every message the other user sent to the current user as read. */
    public void markConversationRead(Long currentUserId, Long otherUserId) {
        List<ChatMessage> unread = chatMessageRepository
                .findBySender_IdAndReceiver_IdAndReadFalse(otherUserId, currentUserId);
        unread.forEach(m -> m.setRead(true));
    }

    public List<ConversationResponse> getConversations(Long currentUserId) {
        List<Long> partnerIds = chatMessageRepository.findConversationPartnerIds(currentUserId);

        return partnerIds.stream()
                .map(partnerId -> buildSummary(currentUserId, partnerId))
                .filter(java.util.Objects::nonNull)
                .sorted(Comparator.comparing(ConversationResponse::getLastMessageAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    private ConversationResponse buildSummary(Long currentUserId, Long partnerId) {
        List<ChatMessage> latestFirst = chatMessageRepository.findLatestFirst(currentUserId, partnerId);
        if (latestFirst.isEmpty()) return null;

        ChatMessage latest = latestFirst.get(0);
        User other = latest.getSender().getId().equals(partnerId) ? latest.getSender() : latest.getReceiver();

        ConversationResponse dto = new ConversationResponse();
        dto.setOtherUserId(other.getId());
        dto.setOtherUserName(other.getName());
        dto.setOtherUserAvatarUrl(other.getAvatarUrl());
        dto.setOtherUserRole(other.getRole());
        dto.setOtherUserPhone(other.getPhone());
        dto.setLastMessage(latest.getContent());
        dto.setLastMessageAt(latest.getCreatedAt());
        dto.setLastMessageMine(latest.getSender().getId().equals(currentUserId));
        dto.setUnreadCount(chatMessageRepository.countByReceiver_IdAndSender_IdAndReadFalse(currentUserId, partnerId));
        return dto;
    }

    public long getTotalUnreadCount(Long currentUserId) {
        return chatMessageRepository.countByReceiver_IdAndReadFalse(currentUserId);
    }
}
