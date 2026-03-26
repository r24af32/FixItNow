package com.fixitnow.backend.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fixitnow.backend.dto.AdminDisputeDetailDTO;
import com.fixitnow.backend.entity.Booking;
import com.fixitnow.backend.entity.Report;
import com.fixitnow.backend.entity.ServiceEntity;
import com.fixitnow.backend.entity.User;
import com.fixitnow.backend.repository.BookingRepository;
import com.fixitnow.backend.repository.ReportRepository;
import com.fixitnow.backend.repository.ServiceRepository;
import com.fixitnow.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AdminReportController {

    private final ReportRepository reportRepository;
    private final BookingRepository bookingRepository;
    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;

    @GetMapping
    public List<Report> getAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/detailed")
    public List<AdminDisputeDetailDTO> getDetailedReports() {
        List<Report> reports = reportRepository.findAllByOrderByCreatedAtDesc();
        List<AdminDisputeDetailDTO> rows = new ArrayList<>();

        for (Report report : reports) {
            rows.add(toDetailedDto(report));
        }

        return rows;
    }

    private AdminDisputeDetailDTO toDetailedDto(Report report) {
        AdminDisputeDetailDTO dto = new AdminDisputeDetailDTO();
        dto.setId(report.getId());
        dto.setReason(report.getReason());
        dto.setStatus(report.getStatus());
        dto.setTargetType(report.getTargetType());
        dto.setTargetId(report.getTargetId());
        dto.setReportedBy(report.getReportedBy());
        dto.setCreatedAt(report.getCreatedAt());

        if (report.getReportedBy() != null) {
            userRepository.findById(report.getReportedBy()).ifPresent(reporter -> {
                dto.setReportedByName(reporter.getName());
                dto.setReportedByEmail(reporter.getEmail());
            });
        }

        String targetType = report.getTargetType() == null
                ? ""
                : report.getTargetType().trim().toUpperCase(Locale.ROOT);

        if ("BOOKING".equals(targetType) && report.getTargetId() != null) {
            bookingRepository.findById(report.getTargetId()).ifPresent(booking -> fillFromBooking(dto, booking));
            return dto;
        }

        if ("SERVICE".equals(targetType) && report.getTargetId() != null) {
            serviceRepository.findById(report.getTargetId()).ifPresent(service -> fillFromService(dto, service));
            return dto;
        }

        if ("PROVIDER".equals(targetType) && report.getTargetId() != null) {
            userRepository.findById(report.getTargetId()).ifPresent(provider -> fillFromProvider(dto, provider));
            return dto;
        }

        if (report.getTargetId() != null) {
            Optional<Booking> maybeBooking = bookingRepository.findById(report.getTargetId());
            maybeBooking.ifPresent(booking -> fillFromBooking(dto, booking));
        }

        return dto;
    }

    private void fillFromBooking(AdminDisputeDetailDTO dto, Booking booking) {
        dto.setBookingId(booking.getId());
        dto.setBookingDate(booking.getBookingDate());
        dto.setBookingStatus(booking.getStatus());
        dto.setTimeSlot(booking.getTimeSlot());

        if (booking.getCustomer() != null) {
            dto.setCustomerId(booking.getCustomer().getId());
            dto.setCustomerName(booking.getCustomer().getName());
            dto.setCustomerEmail(booking.getCustomer().getEmail());
        }

        if (booking.getProvider() != null) {
            fillFromProvider(dto, booking.getProvider());
        }

        if (booking.getService() != null) {
            fillFromService(dto, booking.getService());
        }
    }

    private void fillFromProvider(AdminDisputeDetailDTO dto, User provider) {
        dto.setProviderId(provider.getId());
        dto.setProviderName(provider.getName());
        dto.setProviderEmail(provider.getEmail());
        dto.setProviderActive(!Boolean.FALSE.equals(provider.getActive()));
    }

    private void fillFromService(AdminDisputeDetailDTO dto, ServiceEntity service) {
        dto.setServiceId(service.getId());
        dto.setServiceCategory(service.getCategory());
        dto.setServiceSubcategory(service.getSubcategory());
        dto.setServiceStatus(service.getStatus());
        dto.setServicePrice(service.getPrice());

        if (service.getProvider() != null) {
            fillFromProvider(dto, service.getProvider());
        }
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<Report> resolveReport(@PathVariable Long id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        report.setStatus("RESOLVED");
        return ResponseEntity.ok(reportRepository.save(report));
    }

    @PutMapping("/{id}/dismiss")
    public ResponseEntity<Report> dismissReport(@PathVariable Long id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        report.setStatus("DISMISSED");
        return ResponseEntity.ok(reportRepository.save(report));
    }
}