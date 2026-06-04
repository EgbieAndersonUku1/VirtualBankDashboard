export const RiskLevel = Object.freeze({
    LOW: "LOW",
    MEDIUM: "MEDIUM",
    HIGH: "HIGH",
    CRITICAL: "CRITICAL",
});

export const RuleStatus = Object.freeze({
    PASSED: "passed",
    WARNING: "warning",
    FLAGGED: "flagged",
});


export const rulesCheck = [
    {
        name: 'Account Status',
        message: 'Checking whether the account is active and ensuring it is not frozen or closed.'
    },

    {
        name: 'Full Name',
        message: 'Checking whether the full name matches expected identity records.'
    },
    {
        name: 'Phone Number',
        message: 'Checking whether the phone number is valid and verified.'
    },
    {
        name: 'Address Match',
        message: 'Checking whether the profile and delivery addresses match.'
    },
    {
        name: 'Email Verification',
        message: 'Checking whether the email address has been verified.'
    },
    {
        name: 'Passport',
        message: 'Checking whether passport details are valid and match identity records.'
    },
    {
        name: 'Employment Stability',
        message: 'Checking employment status and income stability indicators.'
    },
    {
        name: 'Login Activity',
        message: 'Checking recent login activity for unusual or suspicious behaviour.'
    },
    {
        name: 'Account Balance',
        message: 'Checking current account balance and overall account health.'
    },
    {
        name: 'Password Reset Activity',
        message: 'Checking password reset frequency for unusual security patterns.'
    },
    {
        name: 'Security Activity',
        message: 'Checking for suspicious or high-risk security events on the account.'
    },
    {
        name: 'Overdraft Usage',
        message: 'Checking overdraft availability and usage history.'
    },
    {
        name: 'KYC Verification',
        message: 'Checking KYC verification status and compliance completion.'
    },
    {
        name: 'Card History',
        message: 'Checking card history for lost, stolen, or replacement activity.'
    }
];