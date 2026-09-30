package com.ptpmhdv.course.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseResponse {
    private Long id;
    private String courseCode;
    private String courseName;
    private Integer credits;
    private Integer maxStudents;
    private Integer remainingSeats;
    private Integer dayOfWeek;
    private Integer startPeriod;
    private Integer endPeriod;
}
