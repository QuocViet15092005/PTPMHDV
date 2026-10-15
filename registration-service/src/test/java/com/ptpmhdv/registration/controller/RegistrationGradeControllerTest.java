package com.ptpmhdv.registration.controller;

import com.ptpmhdv.registration.dto.RegistrationResponse;
import com.ptpmhdv.registration.entity.RegistrationStatus;
import com.ptpmhdv.registration.exception.GlobalExceptionHandler;
import com.ptpmhdv.registration.service.RegistrationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class RegistrationGradeControllerTest {
    @Mock private RegistrationService service;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(new RegistrationController(service))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
    }

    @Test
    void adminCanLoadGradingList() throws Exception {
        when(service.getGradingRegistrations()).thenReturn(List.of(registration()));

        mvc.perform(get("/registrations/grades").header("X-Auth-Role", "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value(41));

        verify(service).getGradingRegistrations();
    }

    @ParameterizedTest
    @ValueSource(strings = {"STUDENT", "", "admin"})
    void nonAdminCannotLoadOrChangeGrades(String role) throws Exception {
        MockHttpServletRequestBuilder list = get("/registrations/grades");
        MockHttpServletRequestBuilder update = put("/registrations/41/grade")
                .contentType(MediaType.APPLICATION_JSON).content("{\"score\":8.5}");
        if (!role.isEmpty()) {
            list.header("X-Auth-Role", role);
            update.header("X-Auth-Role", role);
        }

        mvc.perform(list).andExpect(status().isForbidden());
        mvc.perform(update).andExpect(status().isForbidden());

        verifyNoInteractions(service);
    }

    @Test
    void adminCanSubmitGradeAndReadConvertedResult() throws Exception {
        when(service.updateGrade(41L, new BigDecimal("8.5"))).thenReturn(registration());

        mvc.perform(put("/registrations/41/grade").header("X-Auth-Role", "ADMIN")
                        .contentType(MediaType.APPLICATION_JSON).content("{\"score\":8.5}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.score").value(8.5))
                .andExpect(jsonPath("$.data.letterGrade").value("A"))
                .andExpect(jsonPath("$.data.gradePoint").value(4.0));

        verify(service).updateGrade(41L, new BigDecimal("8.5"));
    }

    @ParameterizedTest
    @ValueSource(strings = {"{}", "{\"score\":null}", "{\"score\":-0.1}",
            "{\"score\":10.1}", "{\"score\":8.55}"})
    void invalidGradeReturnsValidationErrorWithoutCallingService(String body) throws Exception {
        mvc.perform(put("/registrations/41/grade").header("X-Auth-Role", "ADMIN")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data.score").isString());

        verifyNoInteractions(service);
    }

    @Test
    void studentCanReadOnlyOwnGrades() throws Exception {
        when(service.getRegistrationsByStudentId(7L)).thenReturn(List.of(registration()));

        mvc.perform(get("/registrations/student/7").header("X-Auth-Role", "STUDENT")
                        .header("X-Auth-StudentId", "7"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data[0].score").value(8.5));
        mvc.perform(get("/registrations/student/8").header("X-Auth-Role", "STUDENT")
                        .header("X-Auth-StudentId", "7"))
                .andExpect(status().isForbidden());
        mvc.perform(get("/registrations/student/7").header("X-Auth-Role", "STUDENT"))
                .andExpect(status().isForbidden());
        mvc.perform(get("/registrations/student/7"))
                .andExpect(status().isForbidden());

        verify(service).getRegistrationsByStudentId(7L);
        verifyNoMoreInteractions(service);
    }

    @Test
    void studentCannotReadAnotherStudentsIndividualRegistration() throws Exception {
        when(service.getRegistrationById(41L)).thenReturn(registration());

        mvc.perform(get("/registrations/41").header("X-Auth-Role", "STUDENT")
                        .header("X-Auth-StudentId", "8"))
                .andExpect(status().isForbidden());
        mvc.perform(get("/registrations/41").header("X-Auth-Role", "STUDENT")
                        .header("X-Auth-StudentId", "7"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.letterGrade").value("A"));
    }

    @Test
    void adminCanReadStudentGradesWithoutStudentIdentityHeader() throws Exception {
        when(service.getRegistrationsByStudentId(7L)).thenReturn(List.of(registration()));

        mvc.perform(get("/registrations/student/7").header("X-Auth-Role", "ADMIN"))
                .andExpect(status().isOk());
    }

    private RegistrationResponse registration() {
        return RegistrationResponse.builder().id(41L).studentId(7L).courseId(9L)
                .status(RegistrationStatus.ACTIVE).score(new BigDecimal("8.5"))
                .letterGrade("A").gradePoint(4.0).build();
    }
}
