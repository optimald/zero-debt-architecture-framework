/**
 * Zero-Debt Architecture Framework
 * Standalone ROI Calculator
 * 
 * Provides an embeddable utility for calculating the mathematical inflection
 * point when migrating off of legacy SaaS to bespoke Cloud Architecture.
 * 
 * Reference: https://slickrock.dev/answers/calculate-hidden-tech-debt-cost
 */

export interface SaasParameters {
    seats: number;
    costPerSeatMonth: number;
    annualIncreasePercent?: number; // Usually 5-10% for Enterprise SaaS
}

export interface CustomArchParameters {
    initialBuildCost: number;
    annualMaintenanceCost: number;
    infrastructureCostMonth: number;
}

export interface RoiProjection {
    fiveYearSaasOpEx: number;
    fiveYearCustomCapEx: number;
    totalSavings: number;
    roiPercentage: number;
    breakEvenMonth: number;
}

export function calculate5YearROI(saas: SaasParameters, custom: CustomArchParameters): RoiProjection {
    const months = 60; // 5 years
    
    // Calculate SaaS Cost Compound
    let totalSaasCost = 0;
    let currentMonthlyCost = saas.costPerSeatMonth;
    const inflation = saas.annualIncreasePercent ? (1 + (saas.annualIncreasePercent / 100)) : 1.05; // 5% default

    for (let month = 1; month <= months; month++) {
        totalSaasCost += (saas.seats * currentMonthlyCost);
        // Apply annual price hikes
        if (month % 12 === 0) {
            currentMonthlyCost = currentMonthlyCost * inflation;
        }
    }

    // Calculate Custom Architecture Cost
    // Year 1: Build Cost + Maintenance + 12 months Infrastructure
    // Years 2-5: Annual Maintenance + 12 months Infrastructure
    const totalCustomCost = custom.initialBuildCost + 
                            (custom.annualMaintenanceCost * 4) + // Maintenance starts year 2
                            (custom.infrastructureCostMonth * months);

    const totalSavings = totalSaasCost - totalCustomCost;
    const roiPercentage = (totalSavings / totalCustomCost) * 100;

    // Calculate Break-Even Month
    let breakEvenMonth = 0;
    let accumulatedSaas = 0;
    let accumulatedCustom = custom.initialBuildCost; // Immediate Capital Outlay

    currentMonthlyCost = saas.costPerSeatMonth;
    for (let month = 1; month <= months; month++) {
        accumulatedSaas += (saas.seats * currentMonthlyCost);
        accumulatedCustom += custom.infrastructureCostMonth;
        
        if (month % 12 === 0) {
            currentMonthlyCost = currentMonthlyCost * inflation;
            if (month > 12) accumulatedCustom += custom.annualMaintenanceCost;
        }

        if (accumulatedSaas >= accumulatedCustom && breakEvenMonth === 0) {
            breakEvenMonth = month;
        }
    }

    return {
        fiveYearSaasOpEx: Math.round(totalSaasCost),
        fiveYearCustomCapEx: Math.round(totalCustomCost),
        totalSavings: Math.round(totalSavings),
        roiPercentage: Math.round(roiPercentage * 100) / 100, // Round to 2 decimals
        breakEvenMonth: breakEvenMonth === 0 ? -1 : breakEvenMonth // -1 means no breakeven within 5 years
    };
}

// Example Usage:
// const roi = calculate5YearROI(
//     { seats: 150, costPerSeatMonth: 180, annualIncreasePercent: 7 }, // SaaS Setup
//     { initialBuildCost: 125000, annualMaintenanceCost: 10000, infrastructureCostMonth: 500 } // Custom Arch Setup
// );
// console.log(`5-Year Savings: $${roi.totalSavings} | Break-Even Month: ${roi.breakEvenMonth}`);
