package com.ptpmhdv.registration.service;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class GradeScaleTest {
    @ParameterizedTest
    @CsvSource({
            "0.0,F,0.0", "3.9,F,0.0", "4.0,D,1.0", "4.9,D,1.0",
            "5.0,D+,1.5", "5.4,D+,1.5", "5.5,C,2.0", "6.4,C,2.0",
            "6.5,C+,2.5", "6.9,C+,2.5", "7.0,B,3.0", "7.9,B,3.0",
            "8.0,B+,3.5", "8.4,B+,3.5", "8.5,A,4.0", "10.0,A,4.0"
    })
    void convertsEveryGradeBoundary(String score, String letter, double points) {
        assertThat(GradeScale.letter(new BigDecimal(score))).isEqualTo(letter);
        assertThat(GradeScale.points(letter)).isEqualTo(points);
    }
}
