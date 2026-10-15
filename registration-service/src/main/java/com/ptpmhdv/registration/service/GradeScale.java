package com.ptpmhdv.registration.service;

import java.math.BigDecimal;

/** Quy tắc quy đổi dùng trong đồ án; điều chỉnh tại đây nếu đổi thang điểm. */
public final class GradeScale {
    private GradeScale() {}

    public static String letter(BigDecimal score) {
        if (score.compareTo(new BigDecimal("8.5")) >= 0) return "A";
        if (score.compareTo(new BigDecimal("8.0")) >= 0) return "B+";
        if (score.compareTo(new BigDecimal("7.0")) >= 0) return "B";
        if (score.compareTo(new BigDecimal("6.5")) >= 0) return "C+";
        if (score.compareTo(new BigDecimal("5.5")) >= 0) return "C";
        if (score.compareTo(new BigDecimal("5.0")) >= 0) return "D+";
        if (score.compareTo(new BigDecimal("4.0")) >= 0) return "D";
        return "F";
    }

    public static Double points(String letter) {
        if (letter == null) return null;
        return switch (letter) {
            case "A" -> 4.0;
            case "B+" -> 3.5;
            case "B" -> 3.0;
            case "C+" -> 2.5;
            case "C" -> 2.0;
            case "D+" -> 1.5;
            case "D" -> 1.0;
            case "F" -> 0.0;
            default -> null;
        };
    }
}
