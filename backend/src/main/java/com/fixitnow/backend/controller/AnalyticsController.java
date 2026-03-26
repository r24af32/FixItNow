package com.fixitnow.backend.controller;

import com.fixitnow.backend.dto.AnalyticsBookingCountDTO;
import com.fixitnow.backend.dto.AnalyticsUserCountDTO;
import com.fixitnow.backend.dto.MonthlyBookingTrendDTO;
import com.fixitnow.backend.dto.MonthlyRevenueDTO;
import com.fixitnow.backend.dto.TopProviderAnalyticsDTO;
import com.fixitnow.backend.dto.TopServiceAnalyticsDTO;
import com.fixitnow.backend.service.AnalyticsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/admin/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/users/count")
    public ResponseEntity<AnalyticsUserCountDTO> getUserCounts(Principal principal) {
        verifyAdminAccess(principal);
        return ResponseEntity.ok(analyticsService.getUserCounts());
    }

    @GetMapping("/bookings/count")
    public ResponseEntity<AnalyticsBookingCountDTO> getBookingCounts(Principal principal) {
        verifyAdminAccess(principal);
        return ResponseEntity.ok(analyticsService.getBookingCounts());
    }

    @GetMapping("/providers/top")
    public ResponseEntity<List<TopProviderAnalyticsDTO>> getTopProviders(Principal principal) {
        verifyAdminAccess(principal);
        return ResponseEntity.ok(analyticsService.getTopProviders());
    }

    @GetMapping("/services/top")
    public ResponseEntity<List<TopServiceAnalyticsDTO>> getTopServices(Principal principal) {
        verifyAdminAccess(principal);
        return ResponseEntity.ok(analyticsService.getTopServices());
    }

    @GetMapping("/bookings/monthly")
    public ResponseEntity<List<MonthlyBookingTrendDTO>> getMonthlyBookingTrends(Principal principal) {
        verifyAdminAccess(principal);
        return ResponseEntity.ok(analyticsService.getMonthlyBookingTrends());
    }

    @GetMapping("/revenue/monthly")
    public ResponseEntity<List<MonthlyRevenueDTO>> getMonthlyRevenue(Principal principal) {
        verifyAdminAccess(principal);
        return ResponseEntity.ok(analyticsService.getMonthlyRevenue());
    }

    private void verifyAdminAccess(Principal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean hasAdminRole = authentication != null
                && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));

        if (!hasAdminRole) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
    }
}
