package com.ptpmhdv.student.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.math.BigDecimal;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {
    @Id
    private String id; // e.g., GD00124
    
    private String studentId;
    private String type;
    private BigDecimal amount;
    private String status;
    private LocalDate transactionDate;
}
