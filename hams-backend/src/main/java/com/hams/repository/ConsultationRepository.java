package com.hams.repository;

import com.hams.entity.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConsultationRepository extends JpaRepository<Consultation, Long> {

    Optional<Consultation> findByAppointmentId(Long appointmentId);

    boolean existsByAppointmentId(Long appointmentId);

    List<Consultation> findByDoctorIdOrderByCreatedAtDesc(Long doctorId);

    List<Consultation> findByPatientIdOrderByCreatedAtDesc(Long patientId);

    @Query("SELECT c FROM Consultation c WHERE c.doctor.id = :doctorId AND c.id = :id")
    Optional<Consultation> findByIdAndDoctorId(@Param("id") Long id, @Param("doctorId") Long doctorId);

    @Query("SELECT c FROM Consultation c WHERE c.patient.id = :patientId AND c.id = :id")
    Optional<Consultation> findByIdAndPatientId(@Param("id") Long id, @Param("patientId") Long patientId);
}
