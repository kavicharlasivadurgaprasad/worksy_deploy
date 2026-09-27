package com.example.worsi_backend.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * A single direct message between two existing users (customer <-> provider, or any two
 * authenticated users). There is no separate "Conversation" table: a conversation is simply
 * the set of ChatMessage rows between a given pair of user ids, identified on read by
 * (senderId = A AND receiverId = B) OR (senderId = B AND receiverId = A).
 */
@Entity
@Table(name = "chat_messages", indexes = {
        @Index(name = "idx_chat_sender_receiver", columnList = "sender_id, receiver_id"),
        @Index(name = "idx_chat_receiver_sender", columnList = "receiver_id, sender_id")
})
@Getter
@Setter
@NoArgsConstructor
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @Column(nullable = false, length = 2000)
    private String content;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "is_read", nullable = false)
    private boolean read;
}
