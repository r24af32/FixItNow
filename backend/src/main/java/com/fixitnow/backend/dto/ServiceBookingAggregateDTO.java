package com.fixitnow.backend.dto;

public class ServiceBookingAggregateDTO {

    private final Long serviceId;
    private final String category;
    private final String subcategory;
    private final Long totalBookings;

    public ServiceBookingAggregateDTO(Long serviceId, String category, String subcategory, Long totalBookings) {
        this.serviceId = serviceId;
        this.category = category;
        this.subcategory = subcategory;
        this.totalBookings = totalBookings;
    }

    public Long getServiceId() {
        return serviceId;
    }

    public String getCategory() {
        return category;
    }

    public String getSubcategory() {
        return subcategory;
    }

    public Long getTotalBookings() {
        return totalBookings;
    }
}
