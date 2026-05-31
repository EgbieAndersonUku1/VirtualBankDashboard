import { RuleStatus, RiskLevel } from "./risk.js";
import freezeRules from "./utils.js";


export const OVERDRAFT_RULES = freezeRules({

    NOT_ENABLED: {
        RULE: "Overdraft Usage",
        VALUE: "Not Enabled",
        STATUS: RuleStatus.PASSED,
        SCORE: 0,
        REASON: "No overdraft facility is enabled on the account.",
        SEVERITY: RiskLevel.LOW,
    },

    ENABLED: {
        RULE: "Overdraft Usage",
        VALUE: "Enabled",
        STATUS: RuleStatus.PASSED,
        SCORE: 2,
        REASON: "An overdraft facility is available but is not currently being used.",
        SEVERITY: RiskLevel.LOW,
    },

    IN_USE: {
        RULE: "Overdraft Usage",
        VALUE: "In Use",
        STATUS: RuleStatus.WARNING,
        SCORE: 10,
        REASON: "The account is currently using its overdraft facility.",
        SEVERITY: RiskLevel.MEDIUM,
    },

    EXCEEDED: {
        RULE: "Overdraft Usage",
        VALUE: "Exceeded Limit",
        STATUS: RuleStatus.FLAGGED,
        SCORE: 25,
        REASON: "The account has exceeded its approved overdraft limit.",
        SEVERITY: RiskLevel.HIGH,
    },

    REPEATED: {
        RULE: "Overdraft Usage",
        VALUE: "Repeated Overdraft Usage",
        STATUS: RuleStatus.FLAGGED,
        SCORE: 30,
        REASON: "The account frequently relies on overdraft facilities, indicating potential financial stress.",
        SEVERITY: RiskLevel.CRITICAL,
    },

});