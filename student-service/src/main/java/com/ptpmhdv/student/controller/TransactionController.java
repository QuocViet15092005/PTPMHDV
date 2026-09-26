package com.ptpmhdv.student.controller;

import com.ptpmhdv.student.entity.Transaction;
import com.ptpmhdv.student.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;
import java.time.LocalDate;

@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionRepository transactionRepository;

    @GetMapping
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    @GetMapping("/student/{studentId}")
    public List<Transaction> getStudentTransactions(@PathVariable String studentId) {
        return transactionRepository.findByStudentIdOrderByTransactionDateDesc(studentId);
    }

    @PostMapping
    public Transaction createTransaction(@RequestBody Transaction transaction) {
        if (transaction.getId() == null || transaction.getId().isEmpty()) {
            transaction.setId("GD" + System.currentTimeMillis());
        }
        if (transaction.getTransactionDate() == null) {
            transaction.setTransactionDate(LocalDate.now());
        }
        return transactionRepository.save(transaction);
    }

    @DeleteMapping("/{id}")
    public void deleteTransaction(@PathVariable String id) {
        transactionRepository.deleteById(id);
    }
}
