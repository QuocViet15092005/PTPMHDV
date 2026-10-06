package com.university.course_service.dto;

import lombok.*;
import org.springframework.data.domain.Page;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PageResponse<T> {
    private List<T> data;
    private long total;
    private int page;
    private int pages;

    public static <T> PageResponse<T> from(Page<T> p) {
        return PageResponse.<T>builder()
                .data(p.getContent())
                .total(p.getTotalElements())
                .page(p.getNumber() + 1)
                .pages(p.getTotalPages())
                .build();
    }
}