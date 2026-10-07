package com.hams.repository;

import com.hams.entity.DoctorAvailability;
import com.hams.enums.DayOfWeek;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Long> {

    List<DoctorAvailability> findByDoctorIdOrderByDayOfWeek(Long doctorId);

    Optional<DoctorAvailability> findByDoctorIdAndDayOfWeek(Long doctorId, DayOfWeek dayOfWeek);

    List<DoctorAvailability> findByDoctorIdAndActiveTrue(Long doctorId);

    @Query("SELECT DISTINCT da FROM DoctorAvailability da LEFT JOIN FETCH da.breaks " +
           "WHERE da.doctor.id = :doctorId AND da.dayOfWeek = :dayOfWeek AND da.active = true")
    Optional<DoctorAvailability> findActiveByDoctorIdAndDayOfWeekWithBreaks(
        @Param("doctorId") Long doctorId,
        @Param("dayOfWeek") DayOfWeek dayOfWeek
    );

    @Query("SELECT DISTINCT da FROM DoctorAvailability da LEFT JOIN FETCH da.breaks " +
           "WHERE da.doctor.id = :doctorId ORDER BY da.dayOfWeek")
    List<DoctorAvailability> findByDoctorIdWithBreaks(@Param("doctorId") Long doctorId);

    void deleteByDoctorId(Long doctorId);
}
