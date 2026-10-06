package com.university.course_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "courses", uniqueConstraints = @UniqueConstraint(columnNames = "course_code"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "course_code", nullable = false, unique = true, length = 20)
    private String courseCode;

    @Column(name = "course_name", nullable = false, length = 200)
    private String courseName;

    @Column(nullable = false)
    private Integer credits;

    @Column(nullable = false, length = 100)
    private String department;

    @Column(length = 100)
    private String lecturer;

    @Column(nullable = false, length = 20)
    private String semester;

    @Column(name = "max_students", nullable = false)
    private Integer maxStudents;

    @Column(name = "current_students", nullable = false)
    private Integer currentStudents = 0;

    @Column(name = "day_of_week", length = 20)
    private String dayOfWeek;

    @Column(name = "start_time", length = 10)
    private String startTime;

    @Column(name = "end_time", length = 10)
    private String endTime;

    @Column(length = 20)
    private String room;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() { updatedAt = LocalDateTime.now(); }

    @Transient
    public boolean isFull() { return currentStudents >= maxStudents; }
}