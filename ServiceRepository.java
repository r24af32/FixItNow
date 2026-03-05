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
}
