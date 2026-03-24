package com.fixitnow.backend.dto;

public class TopProviderAnalyticsDTO {

    private final Long providerId;
    private final String name;
    private final Long totalCompletedBookings;

    public TopProviderAnalyticsDTO(Long providerId, String name, Long totalCompletedBookings) {
        this.providerId = providerId;
        this.name = name;
        this.totalCompletedBookings = totalCompletedBookings;
    }

    public Long getProviderId() {
        return providerId;
    }

    public String getName() {
        return name;
    }

    public Long getTotalCompletedBookings() {
        return totalCompletedBookings;
    }
}
