package com.fixitnow.backend.controller;

import com.fixitnow.backend.dto.ServiceRequest;
import com.fixitnow.backend.entity.ServiceEntity;
import com.fixitnow.backend.entity.User;
import com.fixitnow.backend.repository.ServiceRepository;
import com.fixitnow.backend.repository.UserRepository;
import com.fixitnow.backend.dto.ServiceRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import com.fixitnow.backend.entity.Role;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = "http://localhost:3000")
public class ServiceController {

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private UserRepository userRepository;

    // 🔹 Provider adds service
    @PostMapping
    public ServiceEntity addService(@RequestBody ServiceRequest request,
            Principal principal) {

        String email = principal.getName();

        User provider = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        if (provider.getRole() != Role.PROVIDER) {
            throw new RuntimeException("Only providers can add services");
        }

        ServiceEntity service = new ServiceEntity();
        service.setCategory(request.getCategory());
        service.setSubcategory(request.getSubcategory());
        service.setDescription(request.getDescription());
        service.setPrice(request.getPrice());
        service.setAvailability(request.getAvailability());
        service.setProvider(provider);

        return serviceRepository.save(service);
    }

    // 🔹 Get all services
    @GetMapping
    public List<ServiceEntity> getAllServices() {
        return serviceRepository.findAll();
    }

    // 🔹 Get by category
    @GetMapping("/category/{category}")
    public List<ServiceEntity> getByCategory(@PathVariable String category) {
        return serviceRepository.findByCategory(category);
    }

    // 🔹 Get by ID
    @GetMapping("/{id}")
    public ServiceEntity getById(@PathVariable Long id) {
        return serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));
    }
}
