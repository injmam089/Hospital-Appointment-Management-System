package com.hams.entity;

import com.hams.enums.NotificationType;
import jakarta.persistence.*;

@Entity
@Table(name = "notifications",
    indexes = @Index(name = "idx_notif_user", columnList = "user_id"))
public class Notification extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NotificationType type = NotificationType.GENERAL;

    public Notification() {
    }

    public Notification(Long id, User user, String title, String message, boolean read, NotificationType type) {
        this.id = id;
        this.user = user;
        this.title = title;
        this.message = message;
        this.read = read;
        this.type = type != null ? type : NotificationType.GENERAL;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private User user;
        private String title;
        private String message;
        private boolean read = false;
        private NotificationType type = NotificationType.GENERAL;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder user(User user) { this.user = user; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder message(String message) { this.message = message; return this; }
        public Builder read(boolean read) { this.read = read; return this; }
        public Builder type(NotificationType type) { this.type = type; return this; }

        public Notification build() {
            return new Notification(id, user, title, message, read, type);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }
}
