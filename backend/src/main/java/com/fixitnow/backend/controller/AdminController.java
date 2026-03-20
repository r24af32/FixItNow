package com.fixitnow.backend.controller;

import com.fixitnow.backend.dto.AdminProviderDashboardDTO;
import com.fixitnow.backend.entity.ProviderProfile;
import com.fixitnow.backend.entity.ServiceEntity;
import com.fixitnow.backend.entity.User;
import com.fixitnow.backend.repository.ProviderProfileRepository;
import com.fixitnow.backend.repository.ServiceRepository;
import com.fixitnow.backend.repository.UserRepository;
import com.fixitnow.backend.service.AdminService;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

        
        private final ServiceRepository serviceRepository;
        private final AdminService adminService;
   
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
        public List<ProviderProfile> getAllProviders() {
        return providerProfileRepository.findAll();
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
        public List<ServiceEntity> getAllServices(
                @RequestParam(required = false) String status) {

        if (status != null) {
                return serviceRepository.findByStatus(status.toUpperCase());
        }

        return serviceRepository.findAll();
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

        @GetMapping("/users")
        public ResponseEntity<?> getAllUsers() {
            try {
                // Fetch all users from the database so the Admin can chat with them
                return ResponseEntity.ok(userRepository.findAll());
            } catch (Exception e) {
                return ResponseEntity.internalServerError().body("Error fetching users: " + e.getMessage());
            }
        }
}
