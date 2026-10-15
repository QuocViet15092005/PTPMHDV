package com.ptpmhdv.registration.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class GradeRequest {
    @NotNull(message = "Vui lòng nhập điểm")
    @DecimalMin(value = "0.0", message = "Điểm phải từ 0 đến 10")
    @DecimalMax(value = "10.0", message = "Điểm phải từ 0 đến 10")
    @Digits(integer = 2, fraction = 1, message = "Điểm có tối đa một chữ số thập phân")
    private BigDecimal score;
}
