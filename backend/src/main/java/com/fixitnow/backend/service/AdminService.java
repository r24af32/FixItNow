package com.fixitnow.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.fixitnow.backend.dto.AdminProviderDashboardDTO;
import com.fixitnow.backend.entity.ProviderProfile;
import com.fixitnow.backend.entity.ServiceEntity;
import com.fixitnow.backend.repository.ProviderProfileRepository;
import com.fixitnow.backend.repository.ServiceRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final ProviderProfileRepository providerProfileRepository;
    private final ServiceRepository serviceRepository;

    public List<AdminProviderDashboardDTO> getProviderDashboard() {

        List<ProviderProfile> profiles = providerProfileRepository.findAll();

        return profiles.stream().map(profile -> {

            Long providerId = profile.getUser().getId();
            String providerName = profile.getUser().getName();
            String category = profile.getCategory();
            String status = profile.getApprovalStatus();

            // Count services for now (since booking logic may not exist)
            List<ServiceEntity> services =
                    serviceRepository.findByProviderId(providerId);

            long totalServices = services.size();

            return new AdminProviderDashboardDTO(
                    providerId,
                    providerName,
                    category,
                    status,
                    totalServices * 5L,      // fake jobs
                    totalServices * 1500.0,  // fake revenue
                    totalServices > 0 ? 4.5 : 0.0  // fake rating
            );

        }).toList();
    }
}