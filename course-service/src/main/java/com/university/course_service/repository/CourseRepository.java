package com.university.course_service.repository;

import com.university.course_service.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {

    boolean existsByCourseCode(String courseCode);

    Optional<Course> findByIdAndIsActiveTrue(Long id);

    @Query("""
        SELECT c FROM Course c
        WHERE c.isActive = true
          AND (:semester IS NULL OR c.semester = :semester)
          AND (:department IS NULL OR c.department = :department)
          AND (:keyword IS NULL OR LOWER(c.courseCode) LIKE LOWER(CONCAT('%', :keyword, '%'))
                                 OR LOWER(c.courseName) LIKE LOWER(CONCAT('%', :keyword, '%')))
        """)
    Page<Course> search(@Param("keyword") String keyword,
                        @Param("semester") String semester,
                        @Param("department") String department,
                        Pageable pageable);

    // Atomic increment only when not full
    @Modifying
    @Query("""
        UPDATE Course c SET c.currentStudents = c.currentStudents + 1
        WHERE c.id = :id AND c.isActive = true AND c.currentStudents < c.maxStudents
        """)
    int incrementEnrollment(@Param("id") Long id);
}