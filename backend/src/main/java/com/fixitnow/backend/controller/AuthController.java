package com.fixitnow.backend.controller;

import com.fixitnow.backend.dto.AuthResponse;
import com.fixitnow.backend.dto.LoginRequest;
import com.fixitnow.backend.dto.RegisterRequest;
import com.fixitnow.backend.entity.ProviderProfile;
import com.fixitnow.backend.entity.Role;
import com.fixitnow.backend.entity.User;
import com.fixitnow.backend.repository.UserRepository;
import com.fixitnow.backend.repository.ProviderProfileRepository;
import com.fixitnow.backend.security.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProviderProfileRepository providerProfileRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        // Check if role is missing
        if (request.getRole() == null) {
            return ResponseEntity.badRequest().body("Role is required");
        }

        // Prevent admin self-registration
        if (request.getRole().equalsIgnoreCase("admin")) {
            return ResponseEntity.badRequest().body("Admin registration is not allowed");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest().body("Passwords do not match");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setLocation(request.getLocation());
        user.setRole(Role.valueOf(request.getRole().toUpperCase()));

        User savedUser = userRepository.save(user);

        if (savedUser.getRole() == Role.PROVIDER) {

            ProviderProfile profile = new ProviderProfile();
            profile.setCategory(request.getCategory());
            profile.setServiceArea(request.getServiceArea());
            profile.setTimeSlots(request.getTimeSlots());
            profile.setIdDocType(request.getIdDocType());
            profile.setLatitude(request.getLatitude());
            profile.setLongitude(request.getLongitude());
            profile.setApprovalStatus("PENDING");
            profile.setUser(savedUser);

            providerProfileRepository.save(profile);
        }

        String token = jwtUtil.generateToken(
                savedUser.getEmail(),
                savedUser.getRole().name());

        return ResponseEntity.ok(
                new AuthResponse(
                        token,
                        savedUser.getId(),
                        savedUser.getName(),
                        savedUser.getEmail(),
                        savedUser.getRole().name().toLowerCase()));

    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest loginRequest) {

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid Password");
        }
        if (user.getRole() == Role.PROVIDER) {

            ProviderProfile profile = providerProfileRepository
                    .findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Provider profile not found"));

            if (!"APPROVED".equals(profile.getApprovalStatus())) {
                throw new RuntimeException("Your account is not approved by admin yet");
            }
        }

        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole().name());

        return new AuthResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name().toLowerCase());

    }
}
