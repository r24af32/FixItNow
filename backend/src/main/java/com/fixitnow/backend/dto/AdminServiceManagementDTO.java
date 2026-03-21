package com.fixitnow.backend.dto;

import java.time.LocalDateTime;

public class AdminServiceManagementDTO {
    private Long id;
    private String category;
    private String subcategory;
    private String description;
    private Double price;
    private String availability;
    private String status;
    private LocalDateTime createdAt;

    private Long providerId;
    private String providerName;
    private String providerEmail;
    private String providerLocation;
    private LocalDateTime providerJoinedAt;
    private String providerApprovalStatus;

    private Long jobsCompleted;
    private Double averageRating;
    private Double revenue;
    private Long reviewCount;

    public AdminServiceManagementDTO(Long id,
                                     String category,
                                     String subcategory,
                                     String description,
                                     Double price,
                                     String availability,
                                     String status,
                                     LocalDateTime createdAt,
                                     Long providerId,
                                     String providerName,
                                     String providerEmail,
                                     String providerLocation,
                                     LocalDateTime providerJoinedAt,
                                     String providerApprovalStatus,
                                     Long jobsCompleted,
                                     Double averageRating,
                                     Double revenue,
                                     Long reviewCount) {
        this.id = id;
        this.category = category;
        this.subcategory = subcategory;
        this.description = description;
        this.price = price;
        this.availability = availability;
        this.status = status;
        this.createdAt = createdAt;
        this.providerId = providerId;
        this.providerName = providerName;
        this.providerEmail = providerEmail;
        this.providerLocation = providerLocation;
        this.providerJoinedAt = providerJoinedAt;
        this.providerApprovalStatus = providerApprovalStatus;
        this.jobsCompleted = jobsCompleted;
        this.averageRating = averageRating;
        this.revenue = revenue;
        this.reviewCount = reviewCount;
    }

    public Long getId() { return id; }
    public String getCategory() { return category; }
    public String getSubcategory() { return subcategory; }
    public String getDescription() { return description; }
    public Double getPrice() { return price; }
    public String getAvailability() { return availability; }
    public String getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public Long getProviderId() { return providerId; }
    public String getProviderName() { return providerName; }
    public String getProviderEmail() { return providerEmail; }
    public String getProviderLocation() { return providerLocation; }
    public LocalDateTime getProviderJoinedAt() { return providerJoinedAt; }
    public String getProviderApprovalStatus() { return providerApprovalStatus; }
    public Long getJobsCompleted() { return jobsCompleted; }
    public Double getAverageRating() { return averageRating; }
    public Double getRevenue() { return revenue; }
    public Long getReviewCount() { return reviewCount; }
}
