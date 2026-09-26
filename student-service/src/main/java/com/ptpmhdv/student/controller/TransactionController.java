package com.ptpmhdv.student.controller;

import com.ptpmhdv.student.entity.Transaction;
import com.ptpmhdv.student.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionRepository transactionRepository;

    @GetMapping("/student/{studentId}")
    public List<Transaction> getStudentTransactions(@PathVariable String studentId) {
        return transactionRepository.findByStudentIdOrderByTransactionDateDesc(studentId);
    }
}
