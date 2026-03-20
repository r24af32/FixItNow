package com.fixitnow.backend.controller;

import com.fixitnow.backend.dto.ServiceRequest;
import com.fixitnow.backend.dto.ServiceResponse;
import com.fixitnow.backend.entity.ServiceEntity;
import com.fixitnow.backend.entity.User;
import com.fixitnow.backend.repository.ProviderProfileRepository;
import com.fixitnow.backend.repository.ServiceRepository;
import com.fixitnow.backend.repository.UserRepository;
import com.fixitnow.backend.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

import com.fixitnow.backend.entity.ProviderProfile;
import com.fixitnow.backend.entity.Role;
import java.util.List;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = "http://localhost:3000")
public class ServiceController {

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProviderProfileRepository providerProfileRepository;

    @Autowired
    private BookingRepository bookingRepository;

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
        service.setStatus("PENDING");

        ProviderProfile profile = providerProfileRepository.findByUser(provider)
                .orElseThrow(() -> new RuntimeException("Provider profile not found"));

        if (!"APPROVED".equals(profile.getApprovalStatus())) {
            throw new RuntimeException("Provider not approved by admin");
        }

        return serviceRepository.save(service);
    }

    // 🔹 Get all services
    // @GetMapping
    // public List<ServiceResponse> getAllServices() {
    // return serviceRepository.findByStatus("APPROVED")
    // .stream()
    // .map(ServiceResponse::new)
    // .toList();
    // }

    @GetMapping
    public List<ServiceResponse> getAllServices(
            @RequestParam(required = false) String location) {

        List<ServiceEntity> services;

        if (location != null && !location.trim().isEmpty()) {
            services = serviceRepository.findApprovedServicesByLocation(location.trim());
        } else {
            services = serviceRepository.findByStatus("APPROVED");
        }

        return services.stream()
                .map(ServiceResponse::new)
                .toList();
    }
    // ADDED: Endpoint to fetch services based on map clicks/coordinates
    // ADD THIS EXACTLY AS WRITTEN to enable radius searching!
    @GetMapping("/nearby")
    public List<ServiceResponse> getNearbyServices(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(defaultValue = "20.0") Double distance) { // 20km radius
        
        return serviceRepository.findServicesNearLocation(lat, lng, distance)
                .stream()
                .filter(s -> "APPROVED".equals(s.getStatus()))
                .map(ServiceResponse::new)
                .toList();
    }

    // 🔹 Get by category
    @GetMapping("/category/{category}")
    public List<ServiceEntity> getByCategory(@PathVariable String category) {
        return serviceRepository.findByCategory(category);
    }

    //  Get by ID
    @GetMapping("/{id}")
    public ServiceResponse getById(@PathVariable Long id) {
        ServiceEntity service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        // 🔥 Calculate the REAL completed jobs count!
        long completedJobs = 0;
        if (service.getProvider() != null) {
            completedJobs = bookingRepository.countByProviderIdAndStatus(service.getProvider().getId(), "COMPLETED");
        }

        // Pass the count into the new constructor
        return new ServiceResponse(service, completedJobs);
    }
    // @PutMapping("/{id}/approve")
    // public ServiceEntity approveService(@PathVariable Long id) {
    // ServiceEntity service = serviceRepository.findById(id)
    // .orElseThrow(() -> new RuntimeException("Service not found"));

    // service.setStatus("APPROVED");
    // return serviceRepository.save(service);
    // }

    // @PutMapping("/{id}/reject")
    // public ServiceEntity rejectService(@PathVariable Long id) {
    // ServiceEntity service = serviceRepository.findById(id)
    // .orElseThrow(() -> new RuntimeException("Service not found"));

    // service.setStatus("REJECTED");
    // return serviceRepository.save(service);
    // }
    @GetMapping("/provider")
    public List<ServiceResponse> getMyServices(Principal principal) {

        String email = principal.getName();

        User provider = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return serviceRepository.findByProviderId(provider.getId())
                .stream()
                .map(ServiceResponse::new)
                .toList();
    }

    @DeleteMapping("/{id}")
    public void deleteService(@PathVariable Long id, Principal principal) {

        String email = principal.getName();

        User provider = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ServiceEntity service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        if (!service.getProvider().getId().equals(provider.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        serviceRepository.delete(service);
    }

    @PutMapping("/{id}")
    public ServiceEntity updateService(
            @PathVariable Long id,
            @RequestBody ServiceRequest request,
            Principal principal) {

        String email = principal.getName();

        User provider = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ServiceEntity service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        if (!service.getProvider().getId().equals(provider.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        service.setCategory(request.getCategory());
        service.setSubcategory(request.getSubcategory());
        service.setDescription(request.getDescription());
        service.setPrice(request.getPrice());
        service.setAvailability(request.getAvailability());

        service.setStatus("PENDING"); // Force re-approval after edit

        return serviceRepository.save(service);
    }

    @GetMapping("/admin/pending")
    public List<ServiceResponse> getPendingServices() {

        return serviceRepository.findByStatus("PENDING")
                .stream()
                .map(ServiceResponse::new)
                .toList();
    }

    @PutMapping("/admin/{id}/approve")
    public ServiceEntity approveService(@PathVariable Long id) {
        ServiceEntity service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        service.setStatus("APPROVED");
        return serviceRepository.save(service);
    }

    @PutMapping("/admin/{id}/reject")
    public ServiceEntity rejectService(@PathVariable Long id) {
        ServiceEntity service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        service.setStatus("REJECTED");
        return serviceRepository.save(service);
    }

}
