package com.fixitnow.backend.repository;

import com.fixitnow.backend.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    // 🔥 This custom query grabs the entire back-and-forth conversation between two people
    // and sorts it by time so the newest messages are at the bottom!
    @Query("SELECT m FROM Message m WHERE (m.senderId = :user1 AND m.receiverId = :user2) OR (m.senderId = :user2 AND m.receiverId = :user1) ORDER BY m.sentAt ASC")
    List<Message> findChatHistory(@Param("user1") Long user1, @Param("user2") Long user2);

    @Query("SELECT m FROM Message m WHERE (m.senderId = :contactId AND m.receiverId IN :adminIds) OR (m.receiverId = :contactId AND m.senderId IN :adminIds) ORDER BY m.sentAt ASC")
    List<Message> findChatHistoryWithAnyAdmin(@Param("contactId") Long contactId, @Param("adminIds") List<Long> adminIds);
}