package com.hams.repository;

import com.hams.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    List<Department> findByActiveTrue();
    Optional<Department> findByName(String name);
    boolean existsByName(String name);
}
