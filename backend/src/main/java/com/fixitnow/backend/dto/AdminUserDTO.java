package com.fixitnow.backend.dto;

import java.time.LocalDateTime;

public class AdminUserDTO {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String location;
    private long bookings;
    private boolean active;
    private LocalDateTime joinedAt;
    private String providerApprovalStatus;

    public AdminUserDTO(Long id,
                        String name,
                        String email,
                        String role,
                        String location,
                        long bookings,
                        boolean active,
                        LocalDateTime joinedAt,
                        String providerApprovalStatus) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.location = location;
        this.bookings = bookings;
        this.active = active;
        this.joinedAt = joinedAt;
        this.providerApprovalStatus = providerApprovalStatus;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public String getLocation() {
        return location;
    }

    public long getBookings() {
        return bookings;
    }

    public boolean isActive() {
        return active;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public String getProviderApprovalStatus() {
        return providerApprovalStatus;
    }
}
