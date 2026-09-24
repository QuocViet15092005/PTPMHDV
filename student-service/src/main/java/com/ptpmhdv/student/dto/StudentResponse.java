package com.ptpmhdv.student.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentResponse {
    private Long id;
    private String studentCode;
    private String fullName;
    private LocalDate dateOfBirth;
    private String gender;
    private String email;
    private String phone;
    private String className;
    private String status;
}
