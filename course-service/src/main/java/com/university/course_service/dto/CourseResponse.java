package com.university.course_service.dto;

import com.university.course_service.entity.Course;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CourseResponse {
    private Long id;
    private String courseCode;
    private String courseName;
    private Integer credits;
    private String department;
    private String lecturer;
    private String semester;
    private Integer maxStudents;
    private Integer currentStudents;
    private Boolean isFull;
    private String dayOfWeek;
    private String startTime;
    private String endTime;
    private String room;
    private String description;

    public static CourseResponse from(Course c) {
        return CourseResponse.builder()
                .id(c.getId())
                .courseCode(c.getCourseCode())
                .courseName(c.getCourseName())
                .credits(c.getCredits())
                .department(c.getDepartment())
                .lecturer(c.getLecturer())
                .semester(c.getSemester())
                .maxStudents(c.getMaxStudents())
                .currentStudents(c.getCurrentStudents())
                .isFull(c.isFull())
                .dayOfWeek(c.getDayOfWeek())
                .startTime(c.getStartTime())
                .endTime(c.getEndTime())
                .room(c.getRoom())
                .description(c.getDescription())
                .build();
    }
}