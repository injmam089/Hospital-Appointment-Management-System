package com.hams.repository;

import com.hams.entity.DoctorLeave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DoctorLeaveRepository extends JpaRepository<DoctorLeave, Long> {

    @Query("SELECT dl FROM DoctorLeave dl WHERE dl.doctor.id = :doctorId ORDER BY COALESCE(dl.startDate, dl.leaveDate) DESC")
    List<DoctorLeave> findByDoctorIdOrderByStartDateDesc(@Param("doctorId") Long doctorId);

    @Query("SELECT COUNT(l) > 0 FROM DoctorLeave l WHERE l.doctor.id = :doctorId " +
           "AND :targetDate BETWEEN COALESCE(l.startDate, l.leaveDate) AND COALESCE(l.endDate, l.leaveDate)")
    boolean isDoctorOnLeave(@Param("doctorId") Long doctorId, @Param("targetDate") LocalDate targetDate);

    @Query("SELECT COUNT(l) > 0 FROM DoctorLeave l WHERE l.doctor.id = :doctorId " +
           "AND :startDate <= COALESCE(l.endDate, l.leaveDate) AND :endDate >= COALESCE(l.startDate, l.leaveDate)")
    boolean hasOverlappingLeave(
        @Param("doctorId") Long doctorId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
}
