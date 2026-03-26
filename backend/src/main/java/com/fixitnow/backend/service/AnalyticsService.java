package com.fixitnow.backend.service;

import com.fixitnow.backend.dto.AnalyticsBookingCountDTO;
import com.fixitnow.backend.dto.AnalyticsUserCountDTO;
import com.fixitnow.backend.dto.MonthlyBookingTrendDTO;
import com.fixitnow.backend.dto.MonthlyRevenueDTO;
import com.fixitnow.backend.dto.ServiceBookingAggregateDTO;
import com.fixitnow.backend.dto.TopProviderAnalyticsDTO;
import com.fixitnow.backend.dto.TopServiceAnalyticsDTO;
import com.fixitnow.backend.entity.Role;
import com.fixitnow.backend.repository.BookingRepository;
import com.fixitnow.backend.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

    public List<MonthlyBookingTrendDTO> getMonthlyBookingTrends() {
        LocalDate today = LocalDate.now();
        List<MonthlyBookingTrendDTO> trends = new ArrayList<>();
        
        // Generate last 6 months
        for (int i = 5; i >= 0; i--) {
            YearMonth month = YearMonth.now().minusMonths(i);
            LocalDate startDate = month.atDay(1);
            LocalDate endDate = month.atEndOfMonth();
            
            long count = bookingRepository.countBookingsByDateRange(startDate, endDate);
            trends.add(new MonthlyBookingTrendDTO(month.format(DateTimeFormatter.ofPattern("MMM")), count));
        }
        
        return trends;
    }

    public List<MonthlyRevenueDTO> getMonthlyRevenue() {
        LocalDate today = LocalDate.now();
        List<MonthlyRevenueDTO> revenues = new ArrayList<>();
        
        // Generate last 6 months
        for (int i = 5; i >= 0; i--) {
            YearMonth month = YearMonth.now().minusMonths(i);
            LocalDate startDate = month.atDay(1);
            LocalDate endDate = month.atEndOfMonth();
            
            double revenue = bookingRepository.sumRevenueByDateRange(startDate, endDate);
            revenues.add(new MonthlyRevenueDTO(month.format(DateTimeFormatter.ofPattern("MMM")), revenue));
        }
        
        return revenues;
    }
}
