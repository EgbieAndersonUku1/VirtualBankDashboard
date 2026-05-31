
import { EMPLOYMENT_STABILITY_RULES, EmploymentTypeLabel } from "./rules/employment.js";
import { PROFILE_INFORMATION_RULES } from "./rules/profileInformation.js";
import { LOGIN_RULES } from "./rules/login.js";
import { BALANCE_RULES } from "./rules/balance.js";
import { OVERDRAFT_RULES } from "./rules/overdraft.js";
import { KYC_RULES, KYCStatus } from "./rules/kyc.js";
import { CARD_RULES } from "./rules/card.js";
import { SECURITY_RULES } from "./rules/security.js";
import { RiskLevel } from "./rules/risk.js";
import { ApplicationDecision } from "./application-decision.js";
import { warnError } from "../logger.js";

  

export class RiskAnalyser {

    constructor() {
        this.score = 0;
        this.flags = [];
    }

    /**
     * When called resets the score and flags
     */
    #resetState() {
        this.score = 0;
        this.flags = [];
    }

    /**
     * Public entry point.
     */
    calculate(accountDetails, profileInformation, cardRequestInformation, employmentInformation) {
        
        const accountDetailsType         = typeof accountDetails;
        const profileInformationType     = typeof profileInformation;
        const cardRequestInformationType = typeof cardRequestInformation;
        const employmentInformationType  = typeof employmentInformation;

        if (
                accountDetailsType !== "object" ||
                profileInformationType !== "object" ||
                cardRequestInformationType !== "object" ||
                employmentInformationType  !== "object"
            ) {

            warnError("RiskAnalyser.calculate", {
                errorMsg: "One or more of the object is not an object",
                accountDetailsType: accountDetailsType,
                profileInformationType: profileInformationType,
                cardRequestInformationType: cardRequestInformationType,
                employmentInformationType: employmentInformationType

            })
            return;
        }

        this.#resetState()

        this.#assessAddressRisk(cardRequestInformation, profileInformation);
        this.#assessEmailRisk(profileInformation);
        this.#assessEmploymentRisk(employmentInformation);
        this.#assessLoginRisk(accountDetails.security);
        this.#assessBalanceRisk(accountDetails.balance);
        this.#assessSecurityRisk(accountDetails);
        this.#assessOverdraftRisk(accountDetails);
        this.#assessKycRisk(accountDetails);
        this.#assessCardHistoryRisk(accountDetails);

        return {
            score: this.score,
            rules: this.flags,
            decision: ApplicationDecision.determine(this.score)
        };
    }

  
    /**
     * Determines the overall risk level based on the
     * calculated risk score.
     *
     * Risk levels are assigned using predefined score
     * thresholds ranging from Low to Critical.
     *
     * @param {number} score - The total calculated risk score.
     * @returns {string} The corresponding risk level.
     */
    #getRiskLevel(score) {
        if (score <= 20) return RiskLevel.LOW;
        if (score <= 50) return RiskLevel.MEDIUM;
        if (score <= 80) return RiskLevel.HIGH;
        return RiskLevel.CRITICAL;
    }

    /**
     * Normalises an address for comparison.
     */
    #formatAddress(address) {
        return [address.line1, address.line2, address.county, address.city, address.postCode]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .replace(/\s+/g, " ")
                .trim();
        }

    /**
     * Adds risk points and records the reason.
     */
    #updateFlag({ rules }) {

        this.score += rules.SCORE;

        this.flags.push({
           name: rules.RULE,
           status: rules.STATUS,
           value: rules.VALUE,
           score: rules.SCORE,
           reason: rules.REASON,
           severity: rules.SEVERITY
        });
    }

    /**
     * Address mismatch checks.
     */
    #assessAddressRisk(cardRequestInformation, profileInformation) {

        const cardAddress    = this.#formatAddress(cardRequestInformation.DeliveryAddress);
        const profileAddress = this.#formatAddress(profileInformation.DeliveryAddress);

        if (cardAddress !== profileAddress) {
            this.#updateFlag({rules: PROFILE_INFORMATION_RULES.ADDRESS.MISMATCHED });
            return;
        }

        this.#updateFlag({rules: PROFILE_INFORMATION_RULES.ADDRESS.MATCHED})

        
    }

    /**
     * Email verification checks.
     */
    #assessEmailRisk(profileInformation) {

        if (!profileInformation.email.verified) {
          
            this.#updateFlag({rules: PROFILE_INFORMATION_RULES.EMAIL.NOT_VERIFIED});
            return;
        }

        this.#updateFlag({rules: PROFILE_INFORMATION_RULES.EMAIL.VERIFIED})

    }

    /**
     * Employment stability checks.
     */
    #assessEmploymentRisk(employmentInformation) {

        if ( !employmentInformation.employed &&
            (
                employmentInformation.employmentType === EmploymentTypeLabel.FULL_TIME ||
                employmentInformation.employmentType === EmploymentTypeLabel.PART_TIME ||
                employmentInformation.employmentType === EmploymentTypeLabel.SELF_EMPLOYED
            )
        ) {
           throw new Error(
                 "Employment status is inconsistent: user is marked as not employed but has a full-time, part-time, or self-employed type."
            );
        }


        if (!employmentInformation.employed) {
            this.#updateFlag({ rules: EMPLOYMENT_STABILITY_RULES.UNEMPLOYED});
            return;
        }

        switch (employmentInformation.employmentType) {

            case EmploymentTypeLabel.FULL_TIME:
                this.#updateFlag({rules: EMPLOYMENT_STABILITY_RULES.FULL_TIME });
                break;

            case EmploymentTypeLabel.PART_TIME:
                this.#updateFlag({ rules: EMPLOYMENT_STABILITY_RULES.PART_TIME });
                break;

            case EmploymentTypeLabel.SELF_EMPLOYED:
                this.#updateFlag({ rules: EMPLOYMENT_STABILITY_RULES.SELF_EMPLOYED});
                break;
            
           
        }
    }

    /**
     * Failed login attempt checks.
     */
    #assessLoginRisk(security) {

        const attempts = security.failedLoginAttempts;

        if (attempts <= 1 || attempts <= 2 )  {
           this.#updateFlag({rules: LOGIN_RULES.FAILED_ATTEMPTS.LOW})
           return; 
        }

        if (attempts <= 5) 
            
            {this.#updateFlag({rules: LOGIN_RULES.FAILED_ATTEMPTS.MEDIUM })
        
        } else if (attempts <= 10) {
            this.#updateFlag({rules: LOGIN_RULES.FAILED_ATTEMPTS.HIGH})
           
        } else {
            this.#updateFlag({rules: LOGIN_RULES.FAILED_ATTEMPTS.CRITICAL })
           
        }
    }

    /**
     * Balance checks.
     */
    #assessBalanceRisk(balance) {

        if (balance.available < 0) {

            this.#updateFlag({ rules: BALANCE_RULES.NEGATIVE });

        } else if (balance.available < 5) {

            this.#updateFlag({ rules: BALANCE_RULES.LOW });

        } else {
            this.#updateFlag({ rules: BALANCE_RULES.POSITIVE })
        }
    }

    /**
     * Security activity checks.
     */
    #assessSecurityRisk(accountDetails) {

        const security = accountDetails.security;

        if (security.passwordResets === 1) {
            this.#updateFlag({ rules: SECURITY_RULES.PASSWORD_RESETS.LOW });
        }
        else if (security.passwordResets <= 3) {
            this.#updateFlag({ rules: SECURITY_RULES.PASSWORD_RESETS.MEDIUM });
        }
        else if (security.passwordResets > 3) {
            this.#updateFlag({ rules: SECURITY_RULES.PASSWORD_RESETS.HIGH });
        }


        switch(security.suspiciousLoginDetected) {

            case true:
                this.#updateFlag({ rules: SECURITY_RULES.SUSPICIOUS_LOGIN.NONE })
                break;
            case false:
                this.#updateFlag({ rules: SECURITY_RULES.SUSPICIOUS_LOGIN.DETECTED })
                break;

        }
       
    }

    /**
     * Overdraft checks.
     */
    #assessOverdraftRisk(accountDetails) {

        const overdraft = accountDetails.overdraft;
        console.log(overdraft.enabled);

        if (!overdraft.enabled) {
            this.#updateFlag({ rules: OVERDRAFT_RULES.NOT_ENABLED });
            return;
        }

        this.#updateFlag({ rules: OVERDRAFT_RULES.ENABLED });

        if (overdraft.currentUsage > 0) {
            this.#updateFlag({ rules: OVERDRAFT_RULES.IN_USE });
        }

        if (overdraft.currentUsage > overdraft.limit) {
            this.#updateFlag({ rules: OVERDRAFT_RULES.EXCEEDED });
        }

        if (overdraft.timesExceeded > 3) {
            this.#updateFlag({
                rules: OVERDRAFT_RULES.REPEATED
            });
        }
    }

    /**
     * KYC checks.
     */
    #assessKycRisk(accountDetails) {

        const kyc = accountDetails.kycStatus;

        switch (kyc.level) {

            case KYCStatus.NONE:
                this.#updateFlag({ rules: KYC_RULES.NONE });
                break;

            case KYCStatus.PARTIAL:
                this.#updateFlag({ rules: KYC_RULES.PARTIAL })
                break;

            case KYCStatus.FULL:
                this.#updateFlag({ rules: KYC_RULES.FULL })
                break;

        }
    }

    /**
     * Card history checks.
     */
   #assessCardHistoryRisk(accountDetails) {
    const history = accountDetails.cardHistory;

    // Always start with the baseline e.g normal
    this.#updateFlag({ rules: CARD_RULES.NORMAL });

    if (history.replacementCards > 0) {
        this.#updateFlag({ rules: CARD_RULES.REPLACEMENT });
    }

    if (history.lostCardsReported > 0) {
        this.#updateFlag({ rules: CARD_RULES.LOST });
    }

    if (history.stolenCardsReported > 0) {
        this.#updateFlag({ rules: CARD_RULES.STOLEN });
    }

    if (
        history.stolenCardsReported > 1 ||
        history.lostCardsReported > 2
    ) {
        this.#updateFlag({ rules: CARD_RULES.REPEATED_LOSS_THEFT_PATTERN });
    }
    }
}