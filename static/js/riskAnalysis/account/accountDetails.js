import { KYCStatus } from "../rules/kyc.js";


const accountDetails = {
    accountId: "ACC-12598-999",

    accountType: "Current Account",

    status: {
        active: true,
        statusText: "Active",
        frozen: false,
        closed: false
    },

    accountCreationDate: "2025-12-25",

    accountAgeDays: 155,

    currency: "GBP",

    balance: {
        available: 200.00,
        pending: 0.00,
        averageMonthlyBalance: 450.25,
        currency: "GBP"
    },

    overdraft: {
        enabled: true,
        limit: 0,
        currentUsage: 0,
        timesExceeded: 0
    },

    kycStatus: {
        level: KYCStatus.FULL,
        methods: ["EMAIL", "PHONE", "PASSPORT"],
        verificationDate: "2025-12-25"
  },

    branch: {
        name: "Chase",
        country: "United Kingdom"
    },

    accountActivity: {
        totalTransactions: 456,
        incomingTransactions: 221,
        outgoingTransactions: 235,
        lastTransactionDate: "2026-05-28"
    },

    cardHistory: {
        activeCards: 1,
        replacementCards: 0,
        lostCardsReported: 0,
        stolenCardsReported: 0
    },

    security: {
        failedLoginAttempts: 0,
        passwordResets: 1,
        suspiciousLoginDetected: false,
       
    }
};

export default accountDetails;