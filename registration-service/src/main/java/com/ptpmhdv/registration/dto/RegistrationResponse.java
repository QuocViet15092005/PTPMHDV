package com.ptpmhdv.registration.dto;

import com.ptpmhdv.registration.dto.external.CourseDTO;
import com.ptpmhdv.registration.dto.external.StudentDTO;
import com.ptpmhdv.registration.entity.RegistrationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistrationResponse {
    private Long id;
    private Long studentId;
    private Long courseId;
    private LocalDateTime registeredAt;
    private RegistrationStatus status;
    private String letterGrade;

    // Chi tiết bổ sung được làm giàu từ các service khác (nếu có)
    private StudentDTO student;
    private CourseDTO course;
}
