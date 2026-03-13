package com.fixitnow.backend.dto;

public class AdminProviderDashboardDTO {

    private Long providerId;
    private String providerName;
    private String category;
    private String approvalStatus;
    private Long totalJobs;
    private Double totalRevenue;
    private Double averageRating;

    public AdminProviderDashboardDTO(Long providerId, String providerName, String category,
                                     String approvalStatus, Long totalJobs,
                                     Double totalRevenue,    Double averageRating) {
        this.providerId = providerId;
        this.providerName = providerName;
        this.category = category;
        this.approvalStatus = approvalStatus;
        this.totalJobs = totalJobs;
        this.totalRevenue = totalRevenue;
        this.averageRating = averageRating;
    }

    // getters only
    public Long getProviderId() { return providerId; }
    public String getProviderName() { return providerName; }
    public String getCategory() { return category; }
    public String getApprovalStatus() { return approvalStatus; }
    public Long getTotalJobs() { return totalJobs; }
    public Double getTotalRevenue() { return totalRevenue; }
    public Double getAverageRating() { return averageRating; }
}