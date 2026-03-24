package com.fixitnow.backend.dto;

public class AnalyticsUserCountDTO {

    private final long totalUsers;
    private final long customers;
    private final long providers;

    public AnalyticsUserCountDTO(long totalUsers, long customers, long providers) {
        this.totalUsers = totalUsers;
        this.customers = customers;
        this.providers = providers;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public long getCustomers() {
        return customers;
    }

    public long getProviders() {
        return providers;
    }
}
