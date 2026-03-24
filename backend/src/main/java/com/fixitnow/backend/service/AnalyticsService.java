package com.fixitnow.backend.service;

import com.fixitnow.backend.dto.AnalyticsBookingCountDTO;
import com.fixitnow.backend.dto.AnalyticsUserCountDTO;
import com.fixitnow.backend.dto.ServiceBookingAggregateDTO;
import com.fixitnow.backend.dto.TopProviderAnalyticsDTO;
import com.fixitnow.backend.dto.TopServiceAnalyticsDTO;
import com.fixitnow.backend.entity.Role;
import com.fixitnow.backend.repository.BookingRepository;
import com.fixitnow.backend.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnalyticsService {

    private static final String PENDING = "PENDING";
    private static final String CONFIRMED = "CONFIRMED";
    private static final String COMPLETED = "COMPLETED";
    private static final String CANCELLED = "CANCELLED";

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    public AnalyticsService(UserRepository userRepository, BookingRepository bookingRepository) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
    }

    public AnalyticsUserCountDTO getUserCounts() {
        long totalUsers = userRepository.count();
        long customers = userRepository.countUsersByRole(Role.CUSTOMER);
        long providers = userRepository.countUsersByRole(Role.PROVIDER);

        return new AnalyticsUserCountDTO(totalUsers, customers, providers);
    }

    public AnalyticsBookingCountDTO getBookingCounts() {
        long totalBookings = bookingRepository.count();
        long pending = bookingRepository.countByStatusIgnoreCase(PENDING);
        long confirmed = bookingRepository.countByStatusIgnoreCase(CONFIRMED);
        long completed = bookingRepository.countByStatusIgnoreCase(COMPLETED);
        long cancelled = bookingRepository.countByStatusIgnoreCase(CANCELLED);

        return new AnalyticsBookingCountDTO(totalBookings, pending, confirmed, completed, cancelled);
    }

    public List<TopProviderAnalyticsDTO> getTopProviders() {
        return bookingRepository.findTopProvidersByCompletedBookings(PageRequest.of(0, 5));
    }

    public List<TopServiceAnalyticsDTO> getTopServices() {
        List<ServiceBookingAggregateDTO> serviceStats = bookingRepository.findTopBookedServices(PageRequest.of(0, 5));

        return serviceStats.stream()
                .map(stat -> new TopServiceAnalyticsDTO(
                        stat.getServiceId(),
                        resolveServiceName(stat.getCategory(), stat.getSubcategory()),
                        stat.getTotalBookings()))
                .toList();
    }

    private String resolveServiceName(String category, String subcategory) {
        if (subcategory != null && !subcategory.isBlank()) {
            return subcategory;
        }
        if (category != null && !category.isBlank()) {
            return category;
        }
        return "Unknown Service";
    }
}
