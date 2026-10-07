package com.hams.service;

import com.hams.dto.notification.NotificationResponse;
import com.hams.entity.Appointment;
import com.hams.entity.Notification;
import com.hams.entity.User;
import com.hams.enums.NotificationType;
import com.hams.exception.HamsException;
import com.hams.repository.NotificationRepository;
import com.hams.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    // ============================================================
    // USER NOTIFICATION APIS (STRICT OWNERSHIP VIA JWT CONTEXT)
    // ============================================================

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getMyNotifications(String userEmail, Boolean unreadOnly, Pageable pageable) {
        User user = getUserByEmail(userEmail);
        Page<Notification> page;
        if (Boolean.TRUE.equals(unreadOnly)) {
            page = notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(user.getId(), pageable);
        } else {
            page = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);
        }
        return page.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String userEmail) {
        User user = getUserByEmail(userEmail);
        return notificationRepository.countByUserIdAndReadFalse(user.getId());
    }

    public NotificationResponse markAsRead(String userEmail, Long notificationId) {
        User user = getUserByEmail(userEmail);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> HamsException.notFound("Notification", notificationId));

        // Strict authorization: user can only modify their own notification
        if (!notification.getUser().getId().equals(user.getId())) {
            throw HamsException.forbidden("You do not have permission to access this notification");
        }

        notification.setRead(true);
        Notification saved = notificationRepository.saveAndFlush(notification);
        return mapToResponse(saved);
    }

    public void markAllAsRead(String userEmail) {
        User user = getUserByEmail(userEmail);
        List<Notification> unreadList = notificationRepository.findByUserIdAndReadFalse(user.getId());
        for (Notification n : unreadList) {
            n.setRead(true);
        }
        notificationRepository.saveAllAndFlush(unreadList);
    }

    // ============================================================
    // NOTIFICATION CREATION & EVENT HELPERS
    // ============================================================

    public Notification createNotification(User user, String title, String message, NotificationType type) {
        if (user == null) {
            log.warn("Cannot create notification with null recipient");
            return null;
        }
        try {
            Notification notification = Notification.builder()
                    .user(user)
                    .title(title)
                    .message(message)
                    .type(type != null ? type : NotificationType.GENERAL)
                    .read(false)
                    .build();
            return notificationRepository.save(notification);
        } catch (Exception ex) {
            log.error("Failed to create notification for user ID: {}", user.getId(), ex);
            return null;
        }
    }

    public void notifyAppointmentConfirmed(Appointment appointment) {
        if (appointment == null || appointment.getPatient() == null) return;
        try {
            User patientUser = appointment.getPatient().getUser();
            String title = "Appointment Confirmed";
            String msg = "Your appointment (" + appointment.getAppointmentRef() + ") with Dr. " +
                    appointment.getDoctor().getFullName() + " on " + appointment.getAppointmentDate() +
                    " at " + appointment.getAppointmentTime() + " is confirmed.";
            createNotification(patientUser, title, msg, NotificationType.APPOINTMENT_CONFIRMED);
        } catch (Exception ex) {
            log.error("Error creating appointment confirmed notification", ex);
        }
    }

    public void notifyAppointmentCancelled(Appointment appointment, String reason) {
        if (appointment == null) return;
        try {
            // Notify patient
            if (appointment.getPatient() != null) {
                User patientUser = appointment.getPatient().getUser();
                String title = "Appointment Cancelled";
                String msg = "Your appointment (" + appointment.getAppointmentRef() + ") with Dr. " +
                        appointment.getDoctor().getFullName() + " on " + appointment.getAppointmentDate() +
                        " has been cancelled." + (reason != null && !reason.isBlank() ? " Reason: " + reason : "");
                createNotification(patientUser, title, msg, NotificationType.APPOINTMENT_CANCELLED);
            }
            // Notify doctor
            if (appointment.getDoctor() != null) {
                User doctorUser = appointment.getDoctor().getUser();
                String title = "Appointment Cancelled";
                String msg = "Appointment (" + appointment.getAppointmentRef() + ") for patient " +
                        appointment.getPatient().getFullName() + " on " + appointment.getAppointmentDate() +
                        " has been cancelled." + (reason != null && !reason.isBlank() ? " Reason: " + reason : "");
                createNotification(doctorUser, title, msg, NotificationType.APPOINTMENT_CANCELLED);
            }
        } catch (Exception ex) {
            log.error("Error creating appointment cancelled notification", ex);
        }
    }

    public void notifyAppointmentRescheduled(Appointment appointment) {
        if (appointment == null) return;
        try {
            if (appointment.getPatient() != null) {
                User patientUser = appointment.getPatient().getUser();
                String title = "Appointment Rescheduled";
                String msg = "Your appointment (" + appointment.getAppointmentRef() + ") with Dr. " +
                        appointment.getDoctor().getFullName() + " has been rescheduled to " +
                        appointment.getAppointmentDate() + " at " + appointment.getAppointmentTime() + ".";
                createNotification(patientUser, title, msg, NotificationType.APPOINTMENT_RESCHEDULED);
            }
            if (appointment.getDoctor() != null) {
                User doctorUser = appointment.getDoctor().getUser();
                String title = "Appointment Rescheduled";
                String msg = "Appointment (" + appointment.getAppointmentRef() + ") for patient " +
                        appointment.getPatient().getFullName() + " has been rescheduled to " +
                        appointment.getAppointmentDate() + " at " + appointment.getAppointmentTime() + ".";
                createNotification(doctorUser, title, msg, NotificationType.APPOINTMENT_RESCHEDULED);
            }
        } catch (Exception ex) {
            log.error("Error creating appointment rescheduled notification", ex);
        }
    }

    public void notifyAppointmentCheckedIn(Appointment appointment) {
        if (appointment == null || appointment.getPatient() == null) return;
        try {
            User patientUser = appointment.getPatient().getUser();
            String title = "Checked In For Consultation";
            String msg = "You are checked in for appointment " + appointment.getAppointmentRef() +
                    ". Please wait for Dr. " + appointment.getDoctor().getFullName() + " to begin your consultation.";
            createNotification(patientUser, title, msg, NotificationType.APPOINTMENT_CHECKED_IN);
        } catch (Exception ex) {
            log.error("Error creating appointment checked-in notification", ex);
        }
    }

    public void notifyConsultationCompleted(Appointment appointment) {
        if (appointment == null || appointment.getPatient() == null) return;
        try {
            User patientUser = appointment.getPatient().getUser();
            String title = "Consultation Completed";
            String msg = "Your consultation for appointment " + appointment.getAppointmentRef() +
                    " with Dr. " + appointment.getDoctor().getFullName() + " has been completed. You can view consultation notes in your portal.";
            createNotification(patientUser, title, msg, NotificationType.CONSULTATION_COMPLETED);
        } catch (Exception ex) {
            log.error("Error creating consultation completed notification", ex);
        }
    }

    public void notifyPrescriptionAvailable(Appointment appointment) {
        if (appointment == null || appointment.getPatient() == null) return;
        try {
            User patientUser = appointment.getPatient().getUser();
            String title = "Digital Prescription Ready";
            String msg = "Dr. " + appointment.getDoctor().getFullName() +
                    " has issued a digital prescription for appointment " + appointment.getAppointmentRef() +
                    ". You can view and download it now.";
            createNotification(patientUser, title, msg, NotificationType.PRESCRIPTION_READY);
        } catch (Exception ex) {
            log.error("Error creating prescription ready notification", ex);
        }
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> HamsException.notFound("User", email));
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .read(notification.isRead())
                .type(notification.getType())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
