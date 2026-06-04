import freezeRules from "./rules/utils.js"
import { RiskLevel, RuleStatus } from "./rules/risk.js"



export const ACCOUNT_STATUS =  freezeRules({
    ACTIVE: {
        RULE: "Account Status",
        VALUE: "Active",
        STATUS: RuleStatus.PASSED,
        SCORE: 0,
        REASON: "Account is active and fully operational.",
        SEVERITY: RiskLevel.LOW,
    },

    FROZEN: {
        RULE: "Account Status",
        VALUE: "Frozen",
        STATUS: RuleStatus.FLAGGED,
        SCORE: 30,
        REASON: "Account is frozen and restricted from activity.",
        SEVERITY: RiskLevel.HIGH,
    },

    CLOSED: {
        RULE: "Account Status",
        VALUE: "Closed",
        STATUS: RuleStatus.BLOCKED,
        SCORE: 50,
        REASON: "Account is closed and no longer usable.",
        SEVERITY: RiskLevel.CRITICAL,
    },
})