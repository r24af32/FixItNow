package com.fixitnow.backend.dto;

public class TopServiceAnalyticsDTO {

    private final Long serviceId;
    private final String serviceName;
    private final Long totalBookings;

    public TopServiceAnalyticsDTO(Long serviceId, String serviceName, Long totalBookings) {
        this.serviceId = serviceId;
        this.serviceName = serviceName;
        this.totalBookings = totalBookings;
    }

    public Long getServiceId() {
        return serviceId;
    }

    public String getServiceName() {
        return serviceName;
    }

    public Long getTotalBookings() {
        return totalBookings;
    }
}
