package com.fixitnow.backend.dto;

import com.fixitnow.backend.entity.ServiceEntity;

public class ServiceResponse {

    private Long id;
    private String category;
    private String subcategory;
    private String description;
    private Double price;
    private String availability;
    private String status;

    private String providerName;
    private String providerLocation;
    
    // ADDED: Coordinates for the map pins
    private Double providerLat; 
    private Double providerLng;

    public ServiceResponse(ServiceEntity service) {
        this.id = service.getId();
        this.category = service.getCategory();
        this.subcategory = service.getSubcategory();
        this.description = service.getDescription();
        this.price = service.getPrice();
        this.availability = service.getAvailability();
        this.status = service.getStatus();
        this.providerName = service.getProvider().getName();
        
        // FIX: Grab the actual city name, not the serviceArea number
        this.providerLocation = service.getProvider().getLocation();

        // FIX: Extract latitude and longitude safely
        if (service.getProvider() != null && service.getProvider().getProviderProfile() != null) {
            this.providerLat = service.getProvider().getProviderProfile().getLatitude();
            this.providerLng = service.getProvider().getProviderProfile().getLongitude();
        }
    }

    public Long getId() { return id; }
    public String getCategory() { return category; }
    public String getSubcategory() { return subcategory; }
    public String getDescription() { return description; }
    public Double getPrice() { return price; }
    public String getAvailability() { return availability; }
    public String getProviderName() { return providerName; }
    public String getProviderLocation() { return providerLocation; }
    public String getStatus() { return status; }
    
    // ADDED: Getters for map coordinates
    public Double getProviderLat() { return providerLat; }
    public Double getProviderLng() { return providerLng; }
}