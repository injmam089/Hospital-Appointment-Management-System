package com.hams.controller;

import com.hams.dto.notification.NotificationResponse;
import com.hams.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "In-app notifications for authenticated users")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @Operation(summary = "Get current user notifications", description = "Returns paginated list of notifications for the authenticated user")
    public ResponseEntity<Page<NotificationResponse>> getNotifications(
            @RequestParam(required = false) Boolean unreadOnly,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            Principal principal
    ) {
        return ResponseEntity.ok(notificationService.getMyNotifications(principal.getName(), unreadOnly, pageable));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notifications count", description = "Returns total count of unread notifications for badge counter")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Principal principal) {
        long count = notificationService.getUnreadCount(principal.getName());
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark notification as read", description = "Marks a specific notification as read. Fails if notification belongs to another user.")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable Long id,
            Principal principal
    ) {
        return ResponseEntity.ok(notificationService.markAsRead(principal.getName(), id));
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Mark all notifications as read", description = "Marks all unread notifications of the current authenticated user as read")
    public ResponseEntity<Map<String, String>> markAllAsRead(Principal principal) {
        notificationService.markAllAsRead(principal.getName());
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }
}
