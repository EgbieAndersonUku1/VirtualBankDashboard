import { RuleStatus, RiskLevel } from "./risk.js";
import freezeRules from "./utils.js";


export const CARD_RULES = freezeRules({

    NORMAL: {
        RULE: "Card History",
        VALUE: "No Issues Reported",
        STATUS: RuleStatus.PASSED,
        SCORE: 0,
        REASON: "No lost, stolen, or replacement card events have been recorded.",
        SEVERITY: RiskLevel.LOW,
    },

    REPLACEMENT: {
        RULE: "Card History",
        VALUE: "Card Replaced",
        STATUS: RuleStatus.WARNING,
        SCORE: 5,
        REASON: "The card has been replaced. Occasional replacements are common and generally low risk.",
        SEVERITY: RiskLevel.LOW,
    },

    LOST: {
        RULE: "Card History",
        VALUE: "Card Reported Lost",
        STATUS: RuleStatus.WARNING,
        SCORE: 10,
        REASON: "The card was reported lost. This may increase the risk of unauthorized access.",
        SEVERITY: RiskLevel.MEDIUM,
    },

    STOLEN: {
        RULE: "Card History",
        VALUE: "Card Reported Stolen",
        STATUS: RuleStatus.FLAGGED,
        SCORE: 25,
        REASON: "The card was reported stolen, increasing the risk of fraudulent activity.",
        SEVERITY: RiskLevel.HIGH,
    },

    REPEATED_LOSS_THEFT_PATTERN: {
        RULE: "Card History",
        VALUE: "Repeated Loss/Theft Pattern",
        STATUS: RuleStatus.FLAGGED,
        SCORE: 30,
        REASON: "Multiple lost or stolen card reports have been recorded, indicating a potentially elevated fraud risk.",
        SEVERITY: RiskLevel.CRITICAL,
    },

});