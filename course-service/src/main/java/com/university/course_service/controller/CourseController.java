package com.university.course_service.controller;

import com.university.course_service.dto.*;
import com.university.course_service.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CourseController {

    private final CourseService service;

    @GetMapping
    public ResponseEntity<PageResponse<CourseResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String semester,
            @RequestParam(required = false) String department,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "100") int limit) {
        return ResponseEntity.ok(service.search(search, semester, department, page, limit));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseResponse> detail(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<CourseResponse> create(@Valid @RequestBody CourseRequest req) {
        return ResponseEntity.status(201).body(service.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseResponse> update(@PathVariable Long id,
                                                 @Valid @RequestBody CourseRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        service.softDelete(id);
        return ResponseEntity.ok(new java.util.HashMap<>() {{
            put("message", "Đã xóa môn học");
        }});
    }

    @PatchMapping("/{id}/enroll")
    public ResponseEntity<CourseResponse> enroll(@PathVariable Long id) {
        return ResponseEntity.ok(service.enroll(id));
    }
}