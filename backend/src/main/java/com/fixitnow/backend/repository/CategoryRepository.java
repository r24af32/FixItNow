package com.fixitnow.backend.repository;

import com.fixitnow.backend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findAllByOrderByNameAsc();

    Optional<Category> findByNameIgnoreCase(String name);
}