package com.ptpmhdv.registration.service;

import com.ptpmhdv.registration.client.CourseClient;
import com.ptpmhdv.registration.client.StudentClient;
import com.ptpmhdv.registration.dto.RegistrationResponse;
import com.ptpmhdv.registration.dto.external.CourseDTO;
import com.ptpmhdv.registration.dto.external.StudentDTO;
import com.ptpmhdv.registration.entity.Registration;
import com.ptpmhdv.registration.entity.RegistrationStatus;
import com.ptpmhdv.registration.exception.BadRequestException;
import com.ptpmhdv.registration.exception.ResourceNotFoundException;
import com.ptpmhdv.registration.repository.RegistrationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RegistrationGradeServiceTest {
    @Mock private RegistrationRepository repository;
    @Mock private StudentClient studentClient;
    @Mock private CourseClient courseClient;
    @InjectMocks private RegistrationService service;

    @Test
    void savesNumericGradeAndReturnsStudentCourseAndConvertedGrade() {
        Registration registration = activeRegistration(41L);
        StudentDTO student = StudentDTO.builder().id(7L).studentCode("SV007").build();
        CourseDTO course = CourseDTO.builder().id(9L).courseCode("SOA").credits(3).build();
        when(repository.findById(41L)).thenReturn(Optional.of(registration));
        when(repository.save(registration)).thenReturn(registration);
        when(studentClient.getStudentById(7L, "ADMIN", null)).thenReturn(student);
        when(courseClient.getCourseById(9L)).thenReturn(course);

        RegistrationResponse result = service.updateGrade(41L, new BigDecimal("8.5"));

        assertThat(registration.getScore()).isEqualByComparingTo("8.5");
        assertThat(registration.getLetterGrade()).isEqualTo("A");
        assertThat(result.getId()).isEqualTo(41L);
        assertThat(result.getScore()).isEqualByComparingTo("8.5");
        assertThat(result.getLetterGrade()).isEqualTo("A");
        assertThat(result.getGradePoint()).isEqualTo(4.0);
        assertThat(result.getStudent()).isSameAs(student);
        assertThat(result.getCourse()).isSameAs(course);
        verify(repository).save(registration);
        verify(courseClient, never()).reserveSeat(any());
        verify(courseClient, never()).releaseSeat(any());
    }

    @Test
    void zeroIsARecordedFailingGradeAndCanBeEdited() {
        Registration registration = activeRegistration(41L);
        when(repository.findById(41L)).thenReturn(Optional.of(registration));
        when(repository.save(registration)).thenReturn(registration);

        RegistrationResponse failed = service.updateGrade(41L, BigDecimal.ZERO);
        assertThat(failed.getScore()).isEqualByComparingTo("0");
        assertThat(failed.getLetterGrade()).isEqualTo("F");
        assertThat(failed.getGradePoint()).isEqualTo(0.0);

        RegistrationResponse corrected = service.updateGrade(41L, new BigDecimal("7.5"));
        assertThat(corrected.getScore()).isEqualByComparingTo("7.5");
        assertThat(corrected.getLetterGrade()).isEqualTo("B");
        assertThat(corrected.getGradePoint()).isEqualTo(3.0);
        assertThat(corrected.getStatus()).isEqualTo(RegistrationStatus.ACTIVE);
        verify(repository, times(2)).save(registration);
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {"-0.1", "10.1", "8.55"})
    void rejectsInvalidScoresBeforeReadingOrWritingRegistration(String rawScore) {
        BigDecimal score = rawScore == null ? null : new BigDecimal(rawScore);

        assertThatThrownBy(() -> service.updateGrade(41L, score))
                .isInstanceOf(BadRequestException.class);

        verifyNoInteractions(repository, studentClient, courseClient);
    }

    @Test
    void rejectsMissingRegistrationWithoutSaving() {
        when(repository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateGrade(999L, new BigDecimal("7.0")))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(repository, never()).save(any());
        verifyNoInteractions(studentClient, courseClient);
    }

    @Test
    void rejectsCancelledRegistrationWithoutChangingExistingGrade() {
        Registration registration = activeRegistration(41L);
        registration.setStatus(RegistrationStatus.CANCELLED);
        when(repository.findById(41L)).thenReturn(Optional.of(registration));

        assertThatThrownBy(() -> service.updateGrade(41L, new BigDecimal("8.0")))
                .isInstanceOf(BadRequestException.class);

        assertThat(registration.getScore()).isNull();
        assertThat(registration.getLetterGrade()).isNull();
        verify(repository, never()).save(any());
        verifyNoInteractions(studentClient, courseClient);
    }

    @Test
    void stillReturnsSavedGradeWhenStudentAndCourseServicesAreUnavailable() {
        Registration registration = activeRegistration(41L);
        when(repository.findById(41L)).thenReturn(Optional.of(registration));
        when(repository.save(registration)).thenReturn(registration);
        when(studentClient.getStudentById(7L, "ADMIN", null))
                .thenThrow(new IllegalStateException("student-service unavailable"));
        when(courseClient.getCourseById(9L))
                .thenThrow(new IllegalStateException("course-service unavailable"));

        RegistrationResponse result = service.updateGrade(41L, new BigDecimal("10.0"));

        assertThat(result.getScore()).isEqualByComparingTo("10.0");
        assertThat(result.getLetterGrade()).isEqualTo("A");
        assertThat(result.getStudent()).isNull();
        assertThat(result.getCourse()).isNull();
        verify(repository).save(registration);
    }

    @Test
    void gradingListIncludesGradedAndUngradedActiveRegistrationsButExcludesCancelled() {
        Registration ungraded = activeRegistration(41L);
        Registration graded = activeRegistration(42L);
        graded.setScore(BigDecimal.ZERO);
        graded.setLetterGrade("F");
        Registration cancelled = activeRegistration(43L);
        cancelled.setStatus(RegistrationStatus.CANCELLED);
        when(repository.findAll()).thenReturn(List.of(ungraded, cancelled, graded));

        List<RegistrationResponse> result = service.getGradingRegistrations();

        assertThat(result).extracting(RegistrationResponse::getId).containsExactly(41L, 42L);
        assertThat(result.get(0).getGradePoint()).isNull();
        assertThat(result.get(1).getGradePoint()).isEqualTo(0.0);
        verify(studentClient, times(2)).getStudentById(7L, "ADMIN", null);
    }

    @Test
    void gradedRegistrationCannotBeCancelledEvenWhenGradeIsZero() {
        Registration registration = activeRegistration(41L);
        registration.setScore(BigDecimal.ZERO);
        registration.setLetterGrade("F");
        when(repository.findById(41L)).thenReturn(Optional.of(registration));

        assertThatThrownBy(() -> service.cancelRegistration(41L))
                .isInstanceOf(BadRequestException.class);

        assertThat(registration.getStatus()).isEqualTo(RegistrationStatus.ACTIVE);
        verify(repository, never()).save(any());
        verifyNoInteractions(courseClient);
    }

    private Registration activeRegistration(Long id) {
        return Registration.builder().id(id).studentId(7L).courseId(9L)
                .status(RegistrationStatus.ACTIVE).build();
    }
}
