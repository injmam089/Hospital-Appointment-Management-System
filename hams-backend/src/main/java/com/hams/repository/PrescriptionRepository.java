package com.hams.repository;

import com.hams.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    Optional<Prescription> findByConsultationId(Long consultationId);

    boolean existsByConsultationId(Long consultationId);

    List<Prescription> findByPatientIdOrderByCreatedAtDesc(Long patientId);

    List<Prescription> findByDoctorIdOrderByCreatedAtDesc(Long doctorId);

    @Query("SELECT p FROM Prescription p WHERE p.patient.id = :patientId AND p.id = :id")
    Optional<Prescription> findByIdAndPatientId(@Param("id") Long id, @Param("patientId") Long patientId);

    @Query("SELECT p FROM Prescription p WHERE p.doctor.id = :doctorId AND p.id = :id")
    Optional<Prescription> findByIdAndDoctorId(@Param("id") Long id, @Param("doctorId") Long doctorId);
}
