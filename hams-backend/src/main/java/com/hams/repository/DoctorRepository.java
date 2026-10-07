package com.hams.repository;

import com.hams.entity.Doctor;
import com.hams.enums.VerificationStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByUserId(Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT d FROM Doctor d WHERE d.id = :id")
    Optional<Doctor> findByIdWithLock(@Param("id") Long id);

    @Query("SELECT d FROM Doctor d WHERE d.active = true AND d.verified = true " +
           "AND (:search IS NULL OR LOWER(d.firstName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           "OR LOWER(d.lastName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           "OR LOWER(d.specialization) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) " +
           "AND (:departmentId IS NULL OR d.department.id = :departmentId)")
    Page<Doctor> searchDoctors(
        @Param("search") String search,
        @Param("departmentId") Long departmentId,
        Pageable pageable
    );

    @Query("SELECT d FROM Doctor d WHERE " +
           "(:search IS NULL OR LOWER(d.firstName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           "OR LOWER(d.lastName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           "OR LOWER(d.specialization) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
           "OR LOWER(d.user.email) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) " +
           "AND (:departmentId IS NULL OR d.department.id = :departmentId) " +
           "AND (:verificationStatus IS NULL OR d.verificationStatus = :verificationStatus) " +
           "AND (:active IS NULL OR d.active = :active)")
    Page<Doctor> adminSearchDoctors(
        @Param("search") String search,
        @Param("departmentId") Long departmentId,
        @Param("verificationStatus") VerificationStatus verificationStatus,
        @Param("active") Boolean active,
        Pageable pageable
    );

    List<Doctor> findByDepartmentId(Long departmentId);

    long countByVerifiedTrue();
    long countByActiveTrue();
    long countByVerificationStatus(VerificationStatus status);
}
