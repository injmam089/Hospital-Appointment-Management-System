package com.hams.repository;

import com.hams.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Page<Notification> findByUserIdAndReadFalseOrderByCreatedAtDesc(Long userId, Pageable pageable);
    List<Notification> findByUserIdAndReadFalse(Long userId);
    long countByUserIdAndReadFalse(Long userId);
    Optional<Notification> findByIdAndUserId(Long id, Long userId);
}

