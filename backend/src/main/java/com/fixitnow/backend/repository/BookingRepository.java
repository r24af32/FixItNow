package com.fixitnow.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.fixitnow.backend.entity.Booking;
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
}