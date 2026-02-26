package com.fixitnow.backend.repository;

import com.fixitnow.backend.entity.ServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceRepository extends JpaRepository<ServiceEntity, Long> {

    List<ServiceEntity> findByCategory(String category);

    List<ServiceEntity> findByProviderId(Long providerId);

    List<ServiceEntity> findByStatus(String status);

    List<ServiceEntity> findAll();
}
