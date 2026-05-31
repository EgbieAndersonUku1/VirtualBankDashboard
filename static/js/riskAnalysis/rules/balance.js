import { RiskLevel, RuleStatus } from "./risk.js";
import freezeRules from "./utils.js";


export const BALANCE_RULES = freezeRules({

    POSITIVE: {
        RULE: "Account Balance",
        VALUE: "Positive Balance",
        STATUS: RuleStatus.PASSED,
        SCORE: 0,
        REASON: "The account maintains a positive balance.",
        SEVERITY: RiskLevel.LOW,
    },

    LOW: {
        RULE: "Account Balance",
        VALUE: "Low Balance",
        STATUS: RuleStatus.WARNING,
        SCORE: 5,
        REASON: "The account balance is low and may indicate financial stress.",
        SEVERITY: RiskLevel.MEDIUM,
    },

    NEGATIVE: {
        RULE: "Account Balance",
        VALUE: "Negative Balance",
        STATUS: RuleStatus.FLAGGED,
        SCORE: 20,
        REASON: "The account balance is negative, indicating the account is overdrawn.",
        SEVERITY: RiskLevel.HIGH,
    },

});