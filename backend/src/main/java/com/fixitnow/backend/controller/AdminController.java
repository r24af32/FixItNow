package com.fixitnow.backend.controller;

import com.fixitnow.backend.dto.AdminProviderDashboardDTO;
import com.fixitnow.backend.dto.AdminServiceManagementDTO;
import com.fixitnow.backend.dto.AdminUserDTO;
import com.fixitnow.backend.entity.ProviderProfile;
import com.fixitnow.backend.entity.Role;
import com.fixitnow.backend.entity.ServiceEntity;
import com.fixitnow.backend.entity.User;
import com.fixitnow.backend.repository.BookingRepository;
import com.fixitnow.backend.repository.ProviderProfileRepository;
import com.fixitnow.backend.repository.ServiceRepository;
import com.fixitnow.backend.repository.UserRepository;
import com.fixitnow.backend.service.AdminService;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AdminController {

        
        private final ServiceRepository serviceRepository;
        private final AdminService adminService;
        private final BookingRepository bookingRepository;
   
        private final ProviderProfileRepository providerProfileRepository;
        private final UserRepository userRepository;


        
        @PutMapping("/approve/{userId}")
        public ResponseEntity<?> approveProvider(@PathVariable Long userId) {

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            ProviderProfile profile = providerProfileRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Provider profile not found"));

            profile.setApprovalStatus("APPROVED");
            providerProfileRepository.save(profile);

            return ResponseEntity.ok("Provider approved successfully");
        }



        @PutMapping("/reject/{userId}")
        public ResponseEntity<?> rejectProvider(@PathVariable Long userId) {

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            ProviderProfile profile = providerProfileRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Provider profile not found"));

            profile.setApprovalStatus("REJECTED");
            providerProfileRepository.save(profile);

            return ResponseEntity.ok("Provider rejected successfully");
        }
        // @GetMapping("/pending-providers")
        // public ResponseEntity<?> getPendingProviders() {

        //     List<ProviderProfile> pendingProviders =
        //             providerProfileRepository.findByApprovalStatus("PENDING");

        //     return ResponseEntity.ok(pendingProviders);
        
        @GetMapping("/pending-providers")
        public List<ProviderProfile> getPendingProviders() {
                return providerProfileRepository.findAll().stream()
                                .filter(profile -> {
                                        String status = profile.getApprovalStatus();
                                        return status == null || status.isBlank() || "PENDING".equalsIgnoreCase(status);
                                })
                                .toList();
        }

        @GetMapping("/providers")
        public List<ProviderProfile> getProviders(
        @RequestParam(required = false) String status) {

         if (status != null) {
        return providerProfileRepository.findByApprovalStatus(status.toUpperCase());
        }

        return providerProfileRepository.findAll();
        }
        
        @GetMapping("/provider-dashboard")
        public List<AdminProviderDashboardDTO> getProviderDashboard() {
                
        return adminService.getProviderDashboard();
        }
       
        @GetMapping("/services")
        public List<AdminServiceManagementDTO> getAllServices(
                @RequestParam(required = false) String status) {
        return adminService.getServiceManagementRows(status);
        }

        @PutMapping("/services/{id}/approve")
        public ServiceEntity approveService(@PathVariable Long id) {
        ServiceEntity service = serviceRepository.findById(id)
                .orElseThrow();
        service.setStatus("APPROVED");
        return serviceRepository.save(service);
        }
        @PutMapping("/services/{id}/suspend")
        public ServiceEntity suspendService(@PathVariable Long id) {
        ServiceEntity service = serviceRepository.findById(id)
                .orElseThrow();
        service.setStatus("SUSPENDED");
        return serviceRepository.save(service);
        }

                @PutMapping("/services/{id}/restore")
                public ServiceEntity restoreService(@PathVariable Long id) {
                ServiceEntity service = serviceRepository.findById(id)
                                .orElseThrow();
                service.setStatus("APPROVED");
                return serviceRepository.save(service);
                }

        @GetMapping("/users")
                public ResponseEntity<?> getAllUsers(@RequestParam(required = false) String role) {
                        try {
                                Stream<User> users = userRepository.findAll().stream();

                                if (role != null && !role.isBlank()) {
                                        String normalizedRole = role.trim().toUpperCase();
                                        users = users.filter(user -> user.getRole() != null
                                                        && user.getRole().name().equals(normalizedRole));
                                }

                                List<AdminUserDTO> response = users
                                                .filter(user -> user.getRole() != null && user.getRole() != Role.ADMIN)
                                        .map(user -> {
                                                Optional<ProviderProfile> profile = providerProfileRepository.findByUser(user);
                                                String approvalStatus = profile.map(ProviderProfile::getApprovalStatus).orElse(null);
                                                long bookingCount = user.getRole() == Role.CUSTOMER
                                                        ? bookingRepository.countByCustomerId(user.getId())
                                                        : bookingRepository.countByProviderIdAndStatus(user.getId(), "COMPLETED");

                                                return new AdminUserDTO(
                                                        user.getId(),
                                                        user.getName(),
                                                        user.getEmail(),
                                                        user.getRole().name(),
                                                        user.getLocation(),
                                                        bookingCount,
                                                        !Boolean.FALSE.equals(user.getActive()),
                                                        user.getCreatedAt(),
                                                        approvalStatus);
                                        })
                                        .filter(user -> !"PROVIDER".equalsIgnoreCase(user.getRole())
                                                || "APPROVED".equalsIgnoreCase(user.getProviderApprovalStatus())
                                                || "SUSPENDED".equalsIgnoreCase(user.getProviderApprovalStatus()))
                                                .toList();

                                return ResponseEntity.ok(response);
                        } catch (Exception e) {
                                return ResponseEntity.internalServerError().body("Error fetching users: " + e.getMessage());
                        }
                }

                @PutMapping("/users/{id}/suspend")
                public ResponseEntity<?> suspendUser(@PathVariable Long id) {
                        User user = userRepository.findById(id)
                                        .orElseThrow(() -> new RuntimeException("User not found"));

                        if (user.getRole() == Role.ADMIN) {
                                return ResponseEntity.badRequest().body("Admin user cannot be suspended");
                        }

                        user.setActive(false);

                        if (user.getRole() == Role.PROVIDER) {
                                providerProfileRepository.findByUser(user).ifPresent(profile -> {
                                        profile.setApprovalStatus("SUSPENDED");
                                        providerProfileRepository.save(profile);
                                });

                                List<ServiceEntity> services = serviceRepository.findByProviderId(user.getId());
                                for (ServiceEntity service : services) {
                                        service.setStatus("SUSPENDED");
                                }
                                serviceRepository.saveAll(services);
                        }

                        userRepository.save(user);
                        return ResponseEntity.ok("User suspended successfully");
                }

                @PutMapping("/users/{id}/activate")
                public ResponseEntity<?> activateUser(@PathVariable Long id) {
                        User user = userRepository.findById(id)
                                        .orElseThrow(() -> new RuntimeException("User not found"));

                        user.setActive(true);

                        if (user.getRole() == Role.PROVIDER) {
                                providerProfileRepository.findByUser(user).ifPresent(profile -> {
                                        if ("SUSPENDED".equalsIgnoreCase(profile.getApprovalStatus())) {
                                                profile.setApprovalStatus("APPROVED");
                                        }
                                        providerProfileRepository.save(profile);
                                });

                                List<ServiceEntity> services = serviceRepository.findByProviderId(user.getId());
                                for (ServiceEntity service : services) {
                                        if ("SUSPENDED".equalsIgnoreCase(service.getStatus())) {
                                                service.setStatus("APPROVED");
                                        }
                                }
                                serviceRepository.saveAll(services);
                        }

                        userRepository.save(user);
                        return ResponseEntity.ok("User activated successfully");
        }
}
