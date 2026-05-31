import { RiskLevel, RuleStatus } from "./risk.js";
import freezeRules from "./utils.js";


export const EmploymentType = Object.freeze({
    FULL_TIME: "FULL_TIME",
    PART_TIME: "PART_TIME",
    SELF_EMPLOYED: "SELF_EMPLOYED",
    UNEMPLOYED: "UNEMPLOYED"
});


export const EmploymentTypeLabel = Object.freeze({
    [EmploymentType.FULL_TIME]: "Full-time Employment",
    [EmploymentType.PART_TIME]: "Part-time Employment",
    [EmploymentType.SELF_EMPLOYED]: "Self-employed",
    [EmploymentType.UNEMPLOYED]: "Unemployed"
});



export const PayFrequency = Object.freeze({
    DAILY: "Daily",
    WEEKLY: "Weekly",
    BI_WEEKLY: "Bi-Weekly",
    MONTHLY: "Monthly"
});

export const Contract = Object.freeze({
    PERMANENT: "Permanent",
    TEMPORARY: "Temporary",
    CONTRACTOR: "Contractor"
});



export const EMPLOYMENT_STABILITY_RULES = freezeRules({

    FULL_TIME: {
        RULE: "Employment Stability",
        VALUE: EmploymentType.FULL_TIME,
        STATUS: RuleStatus.PASSED,
        SCORE: 0,
        REASON: "The user has stable full-time employment.",
        SEVERITY: RiskLevel.LOW,
    },

    PART_TIME: {
        RULE: "Employment Stability",
        VALUE: EmploymentType.PART_TIME,
        STATUS: RuleStatus.WARNING,
        SCORE: 5,
        REASON: "The user has part-time employment which may result in less predictable income.",
        SEVERITY: RiskLevel.LOW,
    },

    SELF_EMPLOYED: {
        RULE: "Employment Stability",
        VALUE: EmploymentType.SELF_EMPLOYED,
        STATUS: RuleStatus.WARNING,
        SCORE: 10,
        REASON: "The user is self-employed. Income may fluctuate depending on business performance.",
        SEVERITY: RiskLevel.MEDIUM,
    },

    UNEMPLOYED: {
        RULE: "Employment Stability",
        VALUE: EmploymentType.UNEMPLOYED,
        STATUS: RuleStatus.FLAGGED,
        SCORE: 15,
        REASON: "The user is currently unemployed and may not have a regular source of income.",
        SEVERITY: RiskLevel.HIGH,
    },

});