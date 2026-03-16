package com.fixitnow.backend.repository;

import com.fixitnow.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // Grabs notifications for a specific user, newest first!
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
}