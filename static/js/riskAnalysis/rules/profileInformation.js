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

    FULL_NAME: {
        MATCHED: {
            RULE: "Full Name",
            VALUE: "Matched",
            STATUS: RuleStatus.PASSED,
            SCORE: 0,
            REASON: "Full name matches identity records.",
            SEVERITY: RiskLevel.LOW,
        },

        NOT_MATCHED: {
            RULE: "Full Name",
            VALUE: "Not matched",
            STATUS: RuleStatus.FLAGGED,
            SCORE: 15,
            REASON: "Full name does not match card request delivery address.",
            SEVERITY: RiskLevel.MEDIUM,
        },
    },

    PHONE_NUMBER: {
        VERIFIED: {
            RULE: "Phone Number",
            VALUE: "Verified",
            STATUS: RuleStatus.PASSED,
            SCORE: 0,
            REASON: "Phone number has been verified successfully.",
            SEVERITY: RiskLevel.LOW,
        },

        NOT_VERIFIED: {
            RULE: "Phone Number",
            VALUE: "Not Verified",
            STATUS: RuleStatus.FLAGGED,
            SCORE: 10,
            REASON: "Phone number has not been verified.",
            SEVERITY: RiskLevel.MEDIUM,
        },

       
    },

    PASSPORT: {
        VERIFIED: {
            RULE: "Passport",
            VALUE: "Verified",
            STATUS: RuleStatus.PASSED,
            SCORE: 0,
            REASON: "Passport has been verified successfully.",
            SEVERITY: RiskLevel.LOW,
        },

        NOT_PROVIDED: {
            RULE: "Passport",
            VALUE: "Not Provided",
            STATUS: RuleStatus.FLAGGED,
            SCORE: 20,
            REASON: "Passport information was not provided.",
            SEVERITY: RiskLevel.MEDIUM,
        },

        NOT_VERIFIED: {
            RULE: "Passport",
            VALUE: "Not Verified",
            STATUS: RuleStatus.FLAGGED,
            SCORE: 20,
            REASON: "Passport has not been verified against identity records.",
            SEVERITY: RiskLevel.MEDIUM,
        },

       
    },

});