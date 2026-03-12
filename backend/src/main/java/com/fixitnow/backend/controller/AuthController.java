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
import org.springframework.http.HttpStatus;
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

        Role parsedRole;
        try {
            parsedRole = Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body("Invalid role");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setLocation(request.getLocation());
        user.setRole(parsedRole);

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
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {

        if (loginRequest.getEmail() == null || loginRequest.getPassword() == null) {
            return ResponseEntity.badRequest().body("Email and password are required");
        }

        User user = userRepository.findByEmail(loginRequest.getEmail()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
        }

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
        }

        if (user.getRole() == Role.PROVIDER) {

            ProviderProfile profile = providerProfileRepository
                    .findByUser(user)
                    .orElse(null);

            if (profile == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Provider profile not found");
            }

            if (!"APPROVED".equals(profile.getApprovalStatus())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Your account is not approved by admin yet");
            }
        }

        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole().name());

        return ResponseEntity.ok(
            new AuthResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name().toLowerCase()));

    }
}
