package com.hams.repository;

import com.hams.entity.Appointment;
import com.hams.enums.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatientIdOrderByAppointmentDateDescAppointmentTimeDesc(Long patientId);

    List<Appointment> findByPatientIdAndStatusOrderByAppointmentDateDescAppointmentTimeDesc(
        Long patientId, AppointmentStatus status);

    List<Appointment> findByDoctorIdOrderByAppointmentDateDescAppointmentTimeDesc(Long doctorId);

    List<Appointment> findByDoctorIdAndAppointmentDateOrderByAppointmentTime(
        Long doctorId, LocalDate date);

    List<Appointment> findByDoctorIdAndStatusOrderByAppointmentDateDescAppointmentTimeDesc(
        Long doctorId, AppointmentStatus status);

    // Double-booking check — checks active appointments excluding terminal non-occupying states
    @Query("SELECT COUNT(a) > 0 FROM Appointment a " +
           "WHERE a.doctor.id = :doctorId " +
           "AND a.appointmentDate = :date " +
           "AND a.appointmentTime = :time " +
           "AND a.status NOT IN ('CANCELLED', 'REJECTED', 'NO_SHOW', 'RESCHEDULED')")
    boolean existsActiveAppointment(
        @Param("doctorId") Long doctorId,
        @Param("date") LocalDate date,
        @Param("time") LocalTime time
    );

    @Query("SELECT a.appointmentTime FROM Appointment a " +
           "WHERE a.doctor.id = :doctorId " +
           "AND a.appointmentDate = :date " +
           "AND a.status NOT IN ('CANCELLED', 'REJECTED', 'NO_SHOW', 'RESCHEDULED')")
    List<LocalTime> findActiveAppointmentTimesByDoctorIdAndDate(
        @Param("doctorId") Long doctorId,
        @Param("date") LocalDate date
    );

    @Query("SELECT a FROM Appointment a " +
           "WHERE a.patient.id = :patientId " +
           "AND a.appointmentDate >= CURRENT_DATE " +
           "AND a.status NOT IN ('CANCELLED', 'REJECTED', 'NO_SHOW', 'RESCHEDULED') " +
           "ORDER BY a.appointmentDate ASC, a.appointmentTime ASC")
    List<Appointment> findUpcomingAppointmentsByPatientId(@Param("patientId") Long patientId);

    @Query("SELECT a FROM Appointment a " +
           "WHERE a.doctor.id = :doctorId " +
           "AND a.appointmentDate = CURRENT_DATE " +
           "ORDER BY a.appointmentTime ASC")
    List<Appointment> findTodayAppointmentsByDoctorId(@Param("doctorId") Long doctorId);

    @Query("SELECT COUNT(a) FROM Appointment a " +
           "WHERE a.doctor.id = :doctorId " +
           "AND a.appointmentDate = CURRENT_DATE " +
           "AND a.status NOT IN ('CANCELLED', 'REJECTED', 'NO_SHOW')")
    long countTodayAppointmentsByDoctorId(@Param("doctorId") Long doctorId);

    Optional<Appointment> findByAppointmentRef(String ref);

    long countByStatus(AppointmentStatus status);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.appointmentDate = CURRENT_DATE")
    long countTodayAppointments();

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.appointmentDate >= CURRENT_DATE AND a.status NOT IN ('CANCELLED', 'REJECTED', 'NO_SHOW')")
    long countUpcomingAppointments();

    @Query("SELECT a FROM Appointment a WHERE " +
           "(:ref IS NULL OR LOWER(a.appointmentRef) LIKE LOWER(CONCAT('%', CAST(:ref AS string), '%'))) AND " +
           "(:patientSearch IS NULL OR LOWER(a.patient.firstName) LIKE LOWER(CONCAT('%', CAST(:patientSearch AS string), '%')) OR LOWER(a.patient.lastName) LIKE LOWER(CONCAT('%', CAST(:patientSearch AS string), '%'))) AND " +
           "(:doctorSearch IS NULL OR LOWER(a.doctor.firstName) LIKE LOWER(CONCAT('%', CAST(:doctorSearch AS string), '%')) OR LOWER(a.doctor.lastName) LIKE LOWER(CONCAT('%', CAST(:doctorSearch AS string), '%'))) AND " +
           "(:departmentId IS NULL OR a.doctor.department.id = :departmentId) AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:startDate IS NULL OR a.appointmentDate >= :startDate) AND " +
           "(:endDate IS NULL OR a.appointmentDate <= :endDate) " +
           "ORDER BY a.appointmentDate DESC, a.appointmentTime DESC")
    Page<Appointment> findAdminAppointmentsFiltered(
        @Param("ref") String ref,
        @Param("patientSearch") String patientSearch,
        @Param("doctorSearch") String doctorSearch,
        @Param("departmentId") Long departmentId,
        @Param("status") AppointmentStatus status,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        Pageable pageable
    );

    @Query("SELECT a.status, COUNT(a) FROM Appointment a WHERE " +
           "(:startDate IS NULL OR a.appointmentDate >= :startDate) AND " +
           "(:endDate IS NULL OR a.appointmentDate <= :endDate) AND " +
           "(:departmentId IS NULL OR a.doctor.department.id = :departmentId) AND " +
           "(:doctorId IS NULL OR a.doctor.id = :doctorId) " +
           "GROUP BY a.status")
    List<Object[]> countAppointmentsByStatusGrouped(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("departmentId") Long departmentId,
        @Param("doctorId") Long doctorId
    );

    @Query("SELECT d.id, d.name, COUNT(DISTINCT doc.id), COUNT(a.id) FROM Department d " +
           "LEFT JOIN Doctor doc ON doc.department.id = d.id " +
           "LEFT JOIN Appointment a ON a.doctor.id = doc.id " +
           "AND (:startDate IS NULL OR a.appointmentDate >= :startDate) " +
           "AND (:endDate IS NULL OR a.appointmentDate <= :endDate) " +
           "AND (:status IS NULL OR a.status = :status) " +
           "WHERE (:departmentId IS NULL OR d.id = :departmentId) " +
           "GROUP BY d.id, d.name " +
           "ORDER BY COUNT(a.id) DESC")
    List<Object[]> getDepartmentReportStats(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("status") AppointmentStatus status,
        @Param("departmentId") Long departmentId
    );

    @Query("SELECT doc.id, CONCAT(doc.firstName, ' ', doc.lastName), dept.name, " +
           "COUNT(a.id), " +
           "SUM(CASE WHEN a.status = 'COMPLETED' THEN 1L ELSE 0L END), " +
           "SUM(CASE WHEN a.status = 'CANCELLED' THEN 1L ELSE 0L END) " +
           "FROM Doctor doc " +
           "LEFT JOIN doc.department dept " +
           "LEFT JOIN Appointment a ON a.doctor.id = doc.id " +
           "AND (:startDate IS NULL OR a.appointmentDate >= :startDate) " +
           "AND (:endDate IS NULL OR a.appointmentDate <= :endDate) " +
           "AND (:status IS NULL OR a.status = :status) " +
           "WHERE (:departmentId IS NULL OR dept.id = :departmentId) " +
           "AND (:doctorId IS NULL OR doc.id = :doctorId) " +
           "GROUP BY doc.id, doc.firstName, doc.lastName, dept.name " +
           "ORDER BY COUNT(a.id) DESC")
    List<Object[]> getDoctorReportStats(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("status") AppointmentStatus status,
        @Param("departmentId") Long departmentId,
        @Param("doctorId") Long doctorId
    );

    @Query("SELECT a.appointmentDate, COUNT(a) FROM Appointment a " +
           "WHERE a.appointmentDate >= :sinceDate " +
           "GROUP BY a.appointmentDate " +
           "ORDER BY a.appointmentDate ASC")
    List<Object[]> countAppointmentsOverTime(@Param("sinceDate") LocalDate sinceDate);
}
