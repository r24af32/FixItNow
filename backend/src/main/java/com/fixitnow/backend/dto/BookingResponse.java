package com.fixitnow.backend.dto;

import java.time.LocalDateTime;

import com.fixitnow.backend.entity.Booking;
import com.fixitnow.backend.entity.ServiceEntity;
import com.fixitnow.backend.entity.User;

public class BookingResponse {

    private Long id;

    private Long customerId;
    private String customerName;

    private Long providerId;
    private String providerName;

    private Long serviceId;
    private String serviceCategory;
    private String serviceSubcategory;

    private String bookingDate;
    private String timeSlot;
    private String status;
    private LocalDateTime createdAt;

    private String customerLocation;
    private Double customerLat; 
    private Double customerLng;
    private String providerLocation;
    private Double providerLat; 
    private Double providerLng;

    public BookingResponse(Booking booking) {
        this.id = booking.getId();

        User customer = booking.getCustomer();
        if (customer != null) {
            this.customerId = customer.getId();
            this.customerName = customer.getName();
            this.customerLocation = customer.getLocation();
            this.customerLat = customer.getLatitude();   // 🔥 ADD THIS
            this.customerLng = customer.getLongitude();
        }

        User provider = booking.getProvider();
        if (provider != null) {
            this.providerId = provider.getId();
            this.providerName = provider.getName();
            this.providerLocation = provider.getLocation();
            this.providerLat = provider.getLatitude();   // 🔥 ADD THIS
            this.providerLng = provider.getLongitude();
        }

        ServiceEntity service = booking.getService();
        if (service != null) {
            this.serviceId = service.getId();
            this.serviceCategory = service.getCategory();
            this.serviceSubcategory = service.getSubcategory();
        }

        this.timeSlot = booking.getTimeSlot();
        this.bookingDate = booking.getBookingDate();
        this.status = booking.getStatus();
        this.createdAt = booking.getCreatedAt();
    }

    public String getCustomerLocation() {
        return customerLocation;
    }

    public String getProviderLocation() {
        return providerLocation;
    }

    public Long getId() {
        return id;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public Long getProviderId() {
        return providerId;
    }

    public String getProviderName() {
        return providerName;
    }

    public Long getServiceId() {
        return serviceId;
    }

    public String getServiceCategory() {
        return serviceCategory;
    }

    public String getServiceSubcategory() {
        return serviceSubcategory;
    }

    public String getTimeSlot() {
        return timeSlot;
    }

    public String getBookingDate() {
        return bookingDate;
    }
    
    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public Double getCustomerLat() { return customerLat; }
    public Double getCustomerLng() { return customerLng; }
    public Double getProviderLat() { return providerLat; }
    public Double getProviderLng() { return providerLng; }
}
