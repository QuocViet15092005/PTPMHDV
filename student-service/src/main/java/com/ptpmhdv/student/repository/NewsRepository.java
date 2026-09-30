package com.ptpmhdv.student.repository;

import com.ptpmhdv.student.entity.News;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NewsRepository extends JpaRepository<News, Long> {
    List<News> findAllByOrderByPinnedDescPublishedDateDesc();
}
