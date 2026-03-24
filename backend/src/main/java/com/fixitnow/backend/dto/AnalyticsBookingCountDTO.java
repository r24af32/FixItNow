package com.fixitnow.backend.dto;

public class AnalyticsBookingCountDTO {

    private final long totalBookings;
    private final long pending;
    private final long confirmed;
    private final long completed;
    private final long cancelled;

    public AnalyticsBookingCountDTO(long totalBookings, long pending, long confirmed, long completed, long cancelled) {
        this.totalBookings = totalBookings;
        this.pending = pending;
        this.confirmed = confirmed;
        this.completed = completed;
        this.cancelled = cancelled;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public long getPending() {
        return pending;
    }

    public long getConfirmed() {
        return confirmed;
    }

    public long getCompleted() {
        return completed;
    }

    public long getCancelled() {
        return cancelled;
    }
}
