package com.university.course_service.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CourseRequest {

    @NotBlank(message = "Mã môn không được trống")
    private String courseCode;

    @NotBlank(message = "Tên môn không được trống")
    private String courseName;

    @NotNull @Min(1) @Max(10)
    private Integer credits;

    @NotBlank
    private String department;

    private String lecturer;

    @NotBlank
    private String semester;

    @NotNull @Min(1)
    private Integer maxStudents;

    private String dayOfWeek;
    private String startTime;
    private String endTime;
    private String room;
    private String description;
}