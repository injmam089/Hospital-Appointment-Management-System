package com.hams.repository;

import com.hams.entity.User;
import com.hams.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByRole(Role role);
    long countByRoleAndActiveTrue(Role role);

    @Query("SELECT u FROM User u WHERE " +
           "(:search IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) AND " +
           "(:role IS NULL OR u.role = :role) AND " +
           "(:active IS NULL OR u.active = :active)")
    Page<User> findUsersFiltered(
        @Param("search") String search,
        @Param("role") Role role,
        @Param("active") Boolean active,
        Pageable pageable
    );
}

