import { RiskLevel, RuleStatus } from "./risk.js";
import freezeRules from "./utils.js";



export const LOGIN_RULES = freezeRules({

    FAILED_ATTEMPTS: {
        NONE: {
            RULE: "Login Activity",
            VALUE: "No Failed Attempts",
            STATUS: RuleStatus.PASSED,
            SCORE: 0,
            REASON: "No failed login attempts detected.",
            SEVERITY: RiskLevel.LOW,
        },

        LOW: {
            RULE: "Login Activity",
            VALUE: "1–2 Failed Attempts",
            STATUS: RuleStatus.PASSED,
            SCORE: 2,
            REASON: "1–2 failed login attempts detected. This is within normal user behaviour.",
            SEVERITY: RiskLevel.LOW,
        },

        MEDIUM: {
            RULE: "Login Activity",
            VALUE: "3–5 Failed Attempts",
            STATUS: RuleStatus.WARNING,
            SCORE: 5,
            REASON: "3–5 failed login attempts detected. This may indicate account access issues.",
            SEVERITY: RiskLevel.MEDIUM,
        },

        HIGH: {
            RULE: "Login Activity",
            VALUE: "6–10 Failed Attempts",
            STATUS: RuleStatus.FLAGGED,
            SCORE: 15,
            REASON: "6–10 failed login attempts detected. This could indicate suspicious login activity.",
            SEVERITY: RiskLevel.HIGH,
        },

        CRITICAL: {
            RULE: "Login Activity",
            VALUE: "10+ Failed Attempts",
            STATUS: RuleStatus.FLAGGED,
            SCORE: 30,
            REASON: "More than 10 failed login attempts detected. This may indicate a brute-force attack or compromised credentials.",
            SEVERITY: RiskLevel.CRITICAL,
        },
    },

});