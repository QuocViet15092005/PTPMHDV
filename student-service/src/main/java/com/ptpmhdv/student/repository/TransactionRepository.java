package com.ptpmhdv.student.repository;

import com.ptpmhdv.student.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, String> {
    List<Transaction> findByStudentIdOrderByTransactionDateDesc(String studentId);
}
