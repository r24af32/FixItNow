package com.fixitnow.backend.repository;

import com.fixitnow.backend.dto.ServiceBookingAggregateDTO;
import com.fixitnow.backend.dto.TopProviderAnalyticsDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.fixitnow.backend.entity.Booking;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // 🔥 FIX: Now it checks Provider + Date + Time!
    boolean existsByProviderIdAndBookingDateAndTimeSlotAndStatusIn(
            Long providerId,
            String bookingDate,
            String timeSlot,
            List<String> statuses);

    List<Booking> findByCustomerId(Long customerId);
    List<Booking> findByProviderId(Long providerId);
    long countByCustomerId(Long customerId);
        long countByProviderIdAndStatus(Long providerId, String status);

        @Query("""
                SELECT COALESCE(SUM(b.service.price), 0)
                FROM Booking b
                WHERE b.provider.id = :providerId
                    AND UPPER(b.status) = 'COMPLETED'
                """)
        Double sumCompletedRevenueByProviderId(@Param("providerId") Long providerId);

    @Query("""
            SELECT COUNT(b)
            FROM Booking b
            WHERE UPPER(b.status) = UPPER(:status)
            """)
    long countByStatusIgnoreCase(@Param("status") String status);

    @Query("""
            SELECT new com.fixitnow.backend.dto.TopProviderAnalyticsDTO(
                b.provider.id,
                b.provider.name,
                COUNT(b)
            )
            FROM Booking b
            WHERE UPPER(b.status) = 'COMPLETED'
            GROUP BY b.provider.id, b.provider.name
            ORDER BY COUNT(b) DESC
            """)
    List<TopProviderAnalyticsDTO> findTopProvidersByCompletedBookings(Pageable pageable);

    @Query("""
            SELECT new com.fixitnow.backend.dto.ServiceBookingAggregateDTO(
                b.service.id,
                b.service.category,
                b.service.subcategory,
                COUNT(b)
            )
            FROM Booking b
            GROUP BY b.service.id, b.service.category, b.service.subcategory
            ORDER BY COUNT(b) DESC
            """)
    List<ServiceBookingAggregateDTO> findTopBookedServices(Pageable pageable);

    @Query("""
            SELECT COUNT(b)
            FROM Booking b
            WHERE CAST(b.bookingDate AS date) >= :startDate
            AND CAST(b.bookingDate AS date) <= :endDate
            """)
    long countBookingsByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("""
            SELECT COALESCE(SUM(b.service.price), 0)
            FROM Booking b
            WHERE CAST(b.bookingDate AS date) >= :startDate
            AND CAST(b.bookingDate AS date) <= :endDate
            AND UPPER(b.status) = 'COMPLETED'
            """)
    double sumRevenueByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}