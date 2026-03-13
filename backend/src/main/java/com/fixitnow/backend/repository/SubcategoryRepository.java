package com.fixitnow.backend.repository;

import com.fixitnow.backend.entity.Subcategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubcategoryRepository extends JpaRepository<Subcategory, Long> {
    List<Subcategory> findByCategoryIdOrderByNameAsc(Long categoryId);

    List<Subcategory> findAllByOrderByNameAsc();

    Optional<Subcategory> findByNameIgnoreCaseAndCategoryId(String name, Long categoryId);
}