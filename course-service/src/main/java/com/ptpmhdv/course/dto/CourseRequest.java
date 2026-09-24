package com.ptpmhdv.course.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseRequest {

    @NotBlank(message = "Mã môn học không được để trống")
    @Size(min = 2, max = 20, message = "Mã môn học phải từ 2 đến 20 ký tự")
    private String courseCode;

    @NotBlank(message = "Tên môn học không được để trống")
    @Size(max = 150, message = "Tên môn học không được vượt quá 150 ký tự")
    private String courseName;

    @NotNull(message = "Số tín chỉ không được để trống")
    @Min(value = 1, message = "Số tín chỉ tối thiểu là 1")
    private Integer credits;

    @NotNull(message = "Số lượng sinh viên tối đa không được để trống")
    @Min(value = 1, message = "Số chỗ tối đa phải lớn hơn 0")
    private Integer maxStudents;

    private Integer remainingSeats;
}
