package com.fixitnow.backend.repository;

import com.fixitnow.backend.entity.ServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ServiceRepository extends JpaRepository<ServiceEntity, Long> {

    List<ServiceEntity> findByCategory(String category);

    List<ServiceEntity> findByProviderId(Long providerId);

    List<ServiceEntity> findByStatus(String status);

    // List<ServiceEntity> findAll();

    @Query("""
    SELECT s FROM ServiceEntity s
    JOIN s.provider u
    JOIN ProviderProfile pp ON pp.user = u
    WHERE s.status = 'APPROVED'
    AND (
        LOWER(pp.serviceArea) LIKE LOWER(CONCAT('%', TRIM(:location), '%'))
    )
    """)
    List<ServiceEntity> findApprovedServicesByLocation(
            @Param("location") String location
    );

    // FIX: Joined 'users' and 'provider_profile' so the math can find the lat/lng columns!
    // This math query MUST have the "JOIN provider_profile pp" lines to work!
    @Query(value = "SELECT s.* FROM services s " +
           "JOIN users u ON s.provider_id = u.id " +
           "JOIN provider_profiles pp ON pp.user_id = u.id " +
           "WHERE (6371 * acos(cos(radians(:lat)) * cos(radians(pp.latitude)) * " +
           "cos(radians(pp.longitude) - radians(:lng)) + " +
           "sin(radians(:lat)) * sin(radians(pp.latitude)))) < :d", 
           nativeQuery = true)
    List<ServiceEntity> findServicesNearLocation(
            @Param("lat") Double lat, 
            @Param("lng") Double lng, 
            @Param("d") double d
    );
}