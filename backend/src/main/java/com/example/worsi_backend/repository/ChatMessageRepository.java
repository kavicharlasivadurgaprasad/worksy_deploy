package com.example.worsi_backend.repository;

import com.example.worsi_backend.Entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    /** Full history between two users (both directions), oldest first. */
    @Query("SELECT m FROM ChatMessage m " +
           "WHERE (m.sender.id = :userA AND m.receiver.id = :userB) " +
           "   OR (m.sender.id = :userB AND m.receiver.id = :userA) " +
           "ORDER BY m.createdAt ASC, m.id ASC")
    List<ChatMessage> findConversation(@Param("userA") Long userA, @Param("userB") Long userB);

    /** Every distinct user id that the given user has exchanged at least one message with. */
    @Query("SELECT DISTINCT CASE WHEN m.sender.id = :userId THEN m.receiver.id ELSE m.sender.id END " +
           "FROM ChatMessage m WHERE m.sender.id = :userId OR m.receiver.id = :userId")
    List<Long> findConversationPartnerIds(@Param("userId") Long userId);

    /** Most recent message between two users, used to build the conversation list preview. */
    @Query("SELECT m FROM ChatMessage m " +
           "WHERE (m.sender.id = :userA AND m.receiver.id = :userB) " +
           "   OR (m.sender.id = :userB AND m.receiver.id = :userA) " +
           "ORDER BY m.createdAt DESC, m.id DESC")
    List<ChatMessage> findLatestFirst(@Param("userA") Long userA, @Param("userB") Long userB);

    long countByReceiver_IdAndSender_IdAndReadFalse(Long receiverId, Long senderId);

    long countByReceiver_IdAndReadFalse(Long receiverId);

    List<ChatMessage> findBySender_IdAndReceiver_IdAndReadFalse(Long senderId, Long receiverId);
}
