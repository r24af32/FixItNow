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

    private AuthResponse buildAuthResponse(User user, ProviderProfile profile) {
        boolean active = !Boolean.FALSE.equals(user.getActive());
        String approvalStatus = profile != null ? profile.getApprovalStatus() : null;
        boolean providerLimited = user.getRole() == Role.PROVIDER
                && (approvalStatus == null || !"APPROVED".equalsIgnoreCase(approvalStatus));
        boolean accessLimited = !active || providerLimited;

        String accessMessage = null;
        if (accessLimited) {
            accessMessage = "Your account is suspended or pending approval. You can message admin, but booking and service features are disabled until approval.";
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name().toLowerCase(),
                active,
                approvalStatus,
                accessLimited,
                accessMessage);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        String normalizedEmail = request.getEmail() == null
                ? null
                : request.getEmail().trim().toLowerCase();

        if (normalizedEmail == null || normalizedEmail.isBlank()) {
            return ResponseEntity.badRequest().body("Email is required");
        }

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

        if (userRepository.findByEmailIgnoreCase(normalizedEmail).isPresent()) {
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
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setLocation(request.getLocation());
        user.setRole(parsedRole);
        user.setLatitude(request.getLatitude());
        user.setLongitude(request.getLongitude());

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

        ProviderProfile savedProfile = null;
        if (savedUser.getRole() == Role.PROVIDER) {
            savedProfile = providerProfileRepository.findByUser(savedUser).orElse(null);
        }

        return ResponseEntity.ok(buildAuthResponse(savedUser, savedProfile));

    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {

        String normalizedEmail = loginRequest.getEmail() == null
                ? null
                : loginRequest.getEmail().trim().toLowerCase();

        if (normalizedEmail == null || normalizedEmail.isBlank()
                || loginRequest.getPassword() == null || loginRequest.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body("Email and password are required");
        }

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
        }

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
        }

        ProviderProfile profile = null;
        if (user.getRole() == Role.PROVIDER) {
            profile = providerProfileRepository
                    .findByUser(user)
                    .orElse(null);

            if (profile == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Provider profile not found");
            }
        }

        return ResponseEntity.ok(buildAuthResponse(user, profile));

    }
}
