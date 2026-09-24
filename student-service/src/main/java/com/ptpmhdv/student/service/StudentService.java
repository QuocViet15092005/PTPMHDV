package com.ptpmhdv.student.service;

import com.ptpmhdv.student.dto.StudentRequest;
import com.ptpmhdv.student.dto.StudentResponse;
import com.ptpmhdv.student.entity.Student;
import com.ptpmhdv.student.exception.BadRequestException;
import com.ptpmhdv.student.exception.ResourceNotFoundException;
import com.ptpmhdv.student.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;

    public List<StudentResponse> getAllStudents(String keyword) {
        List<Student> students;
        if (keyword != null && !keyword.trim().isEmpty()) {
            students = studentRepository.searchStudents(keyword.trim());
        } else {
            students = studentRepository.findAll();
        }
        return students.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public StudentResponse getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sinh viên với ID: " + id));
        return mapToResponse(student);
    }

    public StudentResponse getStudentByCode(String studentCode) {
        Student student = studentRepository.findByStudentCode(studentCode)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sinh viên với mã: " + studentCode));
        return mapToResponse(student);
    }

    @Transactional
    public StudentResponse createStudent(StudentRequest request) {
        if (studentRepository.existsByStudentCode(request.getStudentCode())) {
            throw new BadRequestException("Mã sinh viên '" + request.getStudentCode() + "' đã tồn tại!");
        }

        if (studentRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email '" + request.getEmail() + "' đã được sử dụng!");
        }

        Student student = Student.builder()
                .studentCode(request.getStudentCode())
                .fullName(request.getFullName())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .email(request.getEmail())
                .phone(request.getPhone())
                .className(request.getClassName())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .build();

        Student saved = studentRepository.save(student);
        return mapToResponse(saved);
    }

    @Transactional
    public StudentResponse updateStudent(Long id, StudentRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sinh viên với ID: " + id));

        // Check if updating code to another student's code
        if (!student.getStudentCode().equalsIgnoreCase(request.getStudentCode())
                && studentRepository.existsByStudentCode(request.getStudentCode())) {
            throw new BadRequestException("Mã sinh viên '" + request.getStudentCode() + "' đã được sử dụng bởi sinh viên khác!");
        }

        // Check if updating email to another student's email
        if (!student.getEmail().equalsIgnoreCase(request.getEmail())
                && studentRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email '" + request.getEmail() + "' đã được sử dụng bởi sinh viên khác!");
        }

        student.setStudentCode(request.getStudentCode());
        student.setFullName(request.getFullName());
        student.setDateOfBirth(request.getDateOfBirth());
        student.setGender(request.getGender());
        student.setEmail(request.getEmail());
        student.setPhone(request.getPhone());
        student.setClassName(request.getClassName());
        if (request.getStatus() != null) {
            student.setStatus(request.getStatus());
        }

        Student updated = studentRepository.save(student);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy sinh viên với ID: " + id);
        }
        studentRepository.deleteById(id);
    }

    private StudentResponse mapToResponse(Student student) {
        return StudentResponse.builder()
                .id(student.getId())
                .studentCode(student.getStudentCode())
                .fullName(student.getFullName())
                .dateOfBirth(student.getDateOfBirth())
                .gender(student.getGender())
                .email(student.getEmail())
                .phone(student.getPhone())
                .className(student.getClassName())
                .status(student.getStatus())
                .build();
    }
}
