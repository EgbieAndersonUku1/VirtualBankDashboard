import { RuleStatus, RiskLevel } from "./risk.js";
import freezeRules from "./utils.js";


export const KYCStatus = Object.freeze({
    NONE: "None",
    PARTIAL: "Partial",
    FULL: "Full",
});


export const KYC_RULES = freezeRules({

    NONE: {
        RULE: "KYC Verification",
        VALUE: "Not Verified",
        STATUS: RuleStatus.FLAGGED,
        SCORE: 50,
        REASON: "The user has not completed any KYC verification checks.",
        SEVERITY: RiskLevel.CRITICAL,
    },

    PARTIAL: {
        RULE: "KYC Verification",
        VALUE: "Partially Verified",
        STATUS: RuleStatus.WARNING,
        SCORE: 20,
        REASON: "The user has only partially completed KYC verification requirements.",
        SEVERITY: RiskLevel.HIGH,
    },

    FULL: {
        RULE: "KYC Verification",
        VALUE: "Fully Verified",
        STATUS: RuleStatus.PASSED,
        SCORE: 0,
        REASON: "The user has successfully completed all KYC verification requirements.",
        SEVERITY: RiskLevel.LOW,
    },

});