package com.fixitnow.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fixitnow.backend.entity.Report;
import com.fixitnow.backend.repository.ReportRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportRepository reportRepository;

    @PostMapping
    public ResponseEntity<Report> createReport(@RequestBody Report report) {
        if (report.getTargetType() == null || report.getTargetType().isBlank()) {
            throw new IllegalArgumentException("targetType is required");
        }
        if (report.getTargetId() == null) {
            throw new IllegalArgumentException("targetId is required");
        }
        if (report.getReportedBy() == null) {
            throw new IllegalArgumentException("reportedBy is required");
        }
        if (report.getReason() == null || report.getReason().trim().isEmpty()) {
            throw new IllegalArgumentException("reason is required");
        }

        report.setReason(report.getReason().trim());
        report.setStatus("OPEN");

        Report saved = reportRepository.save(report);
        return ResponseEntity.ok(saved);
    }
}