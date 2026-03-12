package com.fixitnow.backend.controller;

import com.fixitnow.backend.entity.Category;
import com.fixitnow.backend.entity.Subcategory;
import com.fixitnow.backend.repository.CategoryRepository;
import com.fixitnow.backend.repository.SubcategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/catalog")
@CrossOrigin(origins = "http://localhost:3000")
public class CatalogController {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SubcategoryRepository subcategoryRepository;

    @GetMapping("/categories")
    public List<Category> getCategories() {
        return categoryRepository.findAllByOrderByNameAsc();
    }

    @GetMapping("/categories/{categoryId}/subcategories")
    public List<Subcategory> getSubcategoriesByCategory(@PathVariable Long categoryId) {
        return subcategoryRepository.findByCategoryIdOrderByNameAsc(categoryId);
    }

    @GetMapping("/categories-with-subcategories")
    public List<CategoryWithSubcategoriesResponse> getCategoriesWithSubcategories() {
        List<Category> categories = categoryRepository.findAllByOrderByNameAsc();

        Map<Long, List<Subcategory>> groupedSubcategories = subcategoryRepository.findAllByOrderByNameAsc()
                .stream()
                .collect(Collectors.groupingBy(Subcategory::getCategoryId));

        return categories.stream()
                .map(category -> new CategoryWithSubcategoriesResponse(
                        category.getId(),
                        category.getName(),
                        groupedSubcategories.getOrDefault(category.getId(), Collections.emptyList())
                ))
                .toList();
    }

    public static class CategoryWithSubcategoriesResponse {
        private final Long id;
        private final String name;
        private final List<SubcategoryResponse> subcategories;

        public CategoryWithSubcategoriesResponse(Long id, String name, List<Subcategory> subcategories) {
            this.id = id;
            this.name = name;
            this.subcategories = subcategories.stream()
                    .map(subcategory -> new SubcategoryResponse(subcategory.getId(), subcategory.getName(), subcategory.getCategoryId()))
                    .toList();
        }

        public Long getId() {
            return id;
        }

        public String getName() {
            return name;
        }

        public List<SubcategoryResponse> getSubcategories() {
            return subcategories;
        }
    }

    public static class SubcategoryResponse {
        private final Long id;
        private final String name;
        private final Long categoryId;

        public SubcategoryResponse(Long id, String name, Long categoryId) {
            this.id = id;
            this.name = name;
            this.categoryId = categoryId;
        }

        public Long getId() {
            return id;
        }

        public String getName() {
            return name;
        }

        public Long getCategoryId() {
            return categoryId;
        }
    }
}