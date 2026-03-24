package com.fixitnow.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.fixitnow.backend.dto.AdminProviderDashboardDTO;
import com.fixitnow.backend.dto.AdminServiceManagementDTO;
import com.fixitnow.backend.entity.ProviderProfile;
import com.fixitnow.backend.entity.ServiceEntity;
import com.fixitnow.backend.entity.User;
import com.fixitnow.backend.repository.BookingRepository;
import com.fixitnow.backend.repository.ProviderProfileRepository;
import com.fixitnow.backend.repository.ReviewRepository;
import com.fixitnow.backend.repository.ServiceRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final ProviderProfileRepository providerProfileRepository;
    private final ServiceRepository serviceRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;

    public List<AdminProviderDashboardDTO> getProviderDashboard() {

        List<ProviderProfile> profiles = providerProfileRepository.findAll();

        return profiles.stream().map(profile -> {

            Long providerId = profile.getUser().getId();
            String providerName = profile.getUser().getName();
            String category = profile.getCategory();
            String status = profile.getApprovalStatus();

                long completedJobs = bookingRepository.countByProviderIdAndStatus(providerId, "COMPLETED");
                Double revenue = bookingRepository.sumCompletedRevenueByProviderId(providerId);
                Double averageRating = reviewRepository.getAverageRatingByProviderId(providerId);

            return new AdminProviderDashboardDTO(
                    providerId,
                    providerName,
                    category,
                    status,
                    completedJobs,
                    revenue == null ? 0.0 : revenue,
                    averageRating == null ? 0.0 : averageRating
            );

        }).toList();
    }

            public List<AdminServiceManagementDTO> getServiceManagementRows(String status) {
            List<ServiceEntity> services = (status == null || status.isBlank())
                ? serviceRepository.findAll()
                : serviceRepository.findByStatus(status.toUpperCase());

            return services.stream().map(service -> {
                User provider = service.getProvider();
                Long providerId = provider != null ? provider.getId() : null;
                ProviderProfile profile = providerId == null
                        ? null
                        : providerProfileRepository.findByUser(provider).orElse(null);

                if (provider == null) {
                    return null;
                }

                if (Boolean.FALSE.equals(provider.getActive())) {
                    return null;
                }

                if (profile != null && "SUSPENDED".equalsIgnoreCase(profile.getApprovalStatus())) {
                    return null;
                }

                long jobsCompleted = providerId == null
                    ? 0L
                    : bookingRepository.countByProviderIdAndStatus(providerId, "COMPLETED");

                    Double revenueValue = providerId == null
                        ? 0.0
                        : bookingRepository.sumCompletedRevenueByProviderId(providerId);

                    Double ratingValue = providerId == null
                        ? 0.0
                        : reviewRepository.getAverageRatingByProviderId(providerId);

                double revenue = providerId == null
                    ? 0.0
                        : (revenueValue == null
                    ? 0.0
                        : revenueValue);

                double averageRating = providerId == null
                    ? 0.0
                        : (ratingValue == null
                    ? 0.0
                        : ratingValue);

                long reviewCount = providerId == null ? 0L : reviewRepository.countByProviderId(providerId);

                return new AdminServiceManagementDTO(
                    service.getId(),
                    service.getCategory(),
                    service.getSubcategory(),
                    service.getDescription(),
                    service.getPrice(),
                        (service.getAvailability() == null || service.getAvailability().isBlank())
                            ? "all"
                            : service.getAvailability(),
                    service.getStatus(),
                    service.getCreatedAt(),
                    providerId,
                    provider != null ? provider.getName() : null,
                    provider != null ? provider.getEmail() : null,
                    provider != null ? provider.getLocation() : null,
                    provider != null ? provider.getCreatedAt() : null,
                    profile != null ? profile.getApprovalStatus() : null,
                    jobsCompleted,
                    averageRating,
                    revenue,
                    reviewCount
                );
        }).filter(dto -> dto != null).toList();
            }
}