package com.fixitnow.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name="bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔥 Explicitly map to the database columns
    @Column(name = "service_id")
    private Long serviceId;

    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "provider_id")
    private Long providerId;

    @Column(name = "booking_date")
    private LocalDate bookingDate;

    @Column(name = "time_slot")
    private String timeSlot;

    @Column(name = "status")
    private String status;

    public Booking() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getServiceId() { return serviceId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }
    
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    
    public Long getProviderId() { return providerId; }
    public void setProviderId(Long providerId) { this.providerId = providerId; }
    
    public LocalDate getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDate bookingDate) { this.bookingDate = bookingDate; }
    
    public String getTimeSlot() { return timeSlot; }
    public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}