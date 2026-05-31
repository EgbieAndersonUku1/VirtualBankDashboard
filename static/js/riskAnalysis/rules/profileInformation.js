import { RiskLevel, RuleStatus } from "./risk.js";
import freezeRules from "./utils.js";


export const PROFILE_INFORMATION_RULES = freezeRules({

    EMAIL: {
        VERIFIED: {
            RULE: "Email Verification",
            VALUE: "Verified",
            STATUS: RuleStatus.PASSED,
            SCORE: 0,
            REASON: "Email has successfully been verified.",
            SEVERITY: RiskLevel.LOW,
        },

        NOT_VERIFIED: {
            RULE: "Email Verification",
            VALUE: "Not Verified",
            STATUS: RuleStatus.FLAGGED,
            SCORE: 10,
            REASON: "Email address has not been verified.",
            SEVERITY: RiskLevel.MEDIUM,
        },
    },

    ADDRESS: {
        MATCHED: {
            RULE: "Address Match",
            VALUE: "Matched",
            STATUS: RuleStatus.PASSED,
            SCORE: 0,
            REASON: "Profile address matches delivery address.",
            SEVERITY: RiskLevel.LOW,
        },

        MISMATCHED: {
            RULE: "Address Match",
            VALUE: "Mismatched",
            STATUS: RuleStatus.FLAGGED,
            SCORE: 15,
            REASON: "Profile address does not match delivery address.",
            SEVERITY: RiskLevel.MEDIUM,
        },
    },

});