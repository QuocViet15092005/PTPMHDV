package com.ptpmhdv.registration.repository;

import com.ptpmhdv.registration.entity.Registration;
import com.ptpmhdv.registration.entity.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    List<Registration> findByStudentId(Long studentId);

    List<Registration> findByStudentIdAndStatus(Long studentId, RegistrationStatus status);

    List<Registration> findByCourseIdAndStatus(Long courseId, RegistrationStatus status);

    boolean existsByStudentIdAndCourseIdAndStatus(Long studentId, Long courseId, RegistrationStatus status);

    Optional<Registration> findByStudentIdAndCourseIdAndStatus(Long studentId, Long courseId, RegistrationStatus status);
}
