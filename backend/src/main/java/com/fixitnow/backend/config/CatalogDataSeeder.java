package com.fixitnow.backend.config;

import com.fixitnow.backend.entity.Category;
import com.fixitnow.backend.entity.Subcategory;
import com.fixitnow.backend.repository.CategoryRepository;
import com.fixitnow.backend.repository.SubcategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class CatalogDataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final SubcategoryRepository subcategoryRepository;

    public CatalogDataSeeder(CategoryRepository categoryRepository, SubcategoryRepository subcategoryRepository) {
        this.categoryRepository = categoryRepository;
        this.subcategoryRepository = subcategoryRepository;
    }

    @Override
    public void run(String... args) {
        Map<String, List<String>> catalog = Map.of(
                "Electrical", List.of("Wiring", "Switch Repair", "Fan Installation", "Inverter Setup"),
                "Plumbing", List.of("Pipe Repair", "Tap Fitting", "Drain Cleaning", "Water Heater"),
                "Carpentry", List.of("Furniture Repair", "Door Fixing", "Cabinet Making", "Flooring"),
                "AC Repair", List.of("Servicing", "Gas Refill", "Installation", "PCB Repair"),
                "Painting", List.of("Interior", "Exterior", "Waterproofing", "Texture Paint"),
                "Cleaning", List.of("Deep Clean", "Sofa Cleaning", "Bathroom Cleaning", "Kitchen Cleaning"),
                "Appliance", List.of("TV Repair", "Washing Machine", "Refrigerator", "Microwave"),
                "Security", List.of("CCTV Install", "Door Lock", "Alarm System", "Safe Install")
        );

        catalog.forEach((categoryName, subcategories) -> {
            Category category = categoryRepository.findByNameIgnoreCase(categoryName)
                    .orElseGet(() -> {
                        Category newCategory = new Category();
                        newCategory.setName(categoryName);
                        return categoryRepository.save(newCategory);
                    });

            for (String subcategoryName : subcategories) {
                subcategoryRepository.findByNameIgnoreCaseAndCategoryId(subcategoryName, category.getId())
                        .orElseGet(() -> {
                            Subcategory subcategory = new Subcategory();
                            subcategory.setName(subcategoryName);
                            subcategory.setCategoryId(category.getId());
                            return subcategoryRepository.save(subcategory);
                        });
            }
        });
    }
}