package com.example.worsi_backend.dto;

import lombok.Getter;

import java.math.BigDecimal;

/**
 * Private dashboard numbers of ONE provider (only that provider can request them), all derived from
 * the provider's own booking and review rows.
 *
 * Earnings here mean "value of jobs the provider has completed, less the platform commission". The
 * system has no payment-collection records, so this does not claim that money was received or paid out.
 */
@Getter
public class ProviderSummaryResponse {

    private final long completedJobs;
    private final long reviewCount;
    /** null when the provider has no ratings. */
    private final Double averageRating;
    private final BigDecimal grossEarnings;
    private final BigDecimal commissionRate;
    private final BigDecimal platformFee;
    private final BigDecimal netEarnings;

    public ProviderSummaryResponse(ProviderStats stats, BigDecimal grossEarnings,
                                   BigDecimal commissionRate, BigDecimal platformFee, BigDecimal netEarnings) {
        this.completedJobs = stats.completedJobs();
        this.reviewCount = stats.reviewCount();
        this.averageRating = stats.averageRating();
        this.grossEarnings = grossEarnings;
        this.commissionRate = commissionRate;
        this.platformFee = platformFee;
        this.netEarnings = netEarnings;
    }
}
