import { RuleStatus, RiskLevel } from "./risk.js";
import freezeRules from "./utils.js";


export const SECURITY_RULES = freezeRules({

    SUSPICIOUS_LOGIN: {
        NONE: {
            RULE: "Security Activity",
            VALUE: "No Suspicious Logins",
            STATUS: RuleStatus.PASSED,
            SCORE: 0,
            REASON: "No suspicious login activity has been detected.",
            SEVERITY: RiskLevel.LOW,
        },

        DETECTED: {
            RULE: "Security Activity",
            VALUE: "Suspicious Login Detected",
            STATUS: RuleStatus.FLAGGED,
            SCORE: 25,
            REASON: "Suspicious login activity has been detected on the account.",
            SEVERITY: RiskLevel.HIGH,
        },
    },

    PASSWORD_RESETS: {
        LOW: {
            RULE: "Password Reset Activity",
            VALUE: "Low Frequency",
            STATUS: RuleStatus.PASSED,
            SCORE: 2,
            REASON: "A small number of password resets have occurred and are within expected behaviour.",
            SEVERITY: RiskLevel.LOW,
        },

        MEDIUM: {
            RULE: "Password Reset Activity",
            VALUE: "Moderate Frequency",
            STATUS: RuleStatus.WARNING,
            SCORE: 5,
            REASON: "Several password resets have occurred, which may indicate account access issues.",
            SEVERITY: RiskLevel.MEDIUM,
        },

        HIGH: {
            RULE: "Password Reset Activity",
            VALUE: "High Frequency",
            STATUS: RuleStatus.FLAGGED,
            SCORE: 15,
            REASON: "Frequent password resets have occurred, indicating potentially suspicious account activity.",
            SEVERITY: RiskLevel.HIGH,
        },
    },

});