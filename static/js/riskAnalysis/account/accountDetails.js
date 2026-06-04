/**
 * Account Details Configuration
 *
 * This file defines the core account dataset used throughout the application.
 *
 * It acts as the single source of truth for both:
 * 1. Risk analysis calculations (scoring, rule evaluation, and decisions)
 * 2. UI rendering (displayed values in the frontend such as account details, balances,
 *    and personal/account information sections)
 *
 * These values are intentionally designed to be manually edited within this object
 * to simulate different user scenarios. Any changes will immediately be reflected in
 * both the risk analysis output and the rendered UI.
 *
 * This file contains only static data and should not include any business logic or
 * computational functions. All processing is handled elsewhere in the system.
 */

import { KYCStatus } from "../rules/kyc.js";


const AccountType = Object.freeze({
    CURRENT_ACCOUNT:  "Current Account",
    SAVINGS_ACCOUNT:  "Savings Account",
   
})


// manipulate the data on the right side to see different risks outcome as well as different UI display
const accountDetails = {
    accountId: "ACC-12598-999",
    accountType: AccountType.SAVINGS_ACCOUNT,
    sortCode: 700319,
    accountNumber: 14216789, // any number as long as it doesn't starting with 0

   
    accountCreationDate: "2025-12-27", // YYYY-MM-DD
    accountAgeDays: 155,
    numberOfAccounts: 3,

    status: {
        active: true,
        frozen: false,
        closed: false
    },


    balance: {
        available: 2026.26,  // value can be a postive or a negative value, only numbers or floats, the app will handle the currency e.g £, $, etc
        pending: 0.00,
        averageMonthlyBalance: 450.25,
        currencyLabel: "£",
        currency: "GBP",

    },

    overdraft: {
        enabled: true,
        limit: 0,
        currentUsage: 0,
        timesExceeded: 0
    },

    kycStatus: {
        level: KYCStatus.PARTIAL,
        methods: ["EMAIL", "PHONE", "PASSPORT"],
        verificationDate: "2025-12-25"
  },

    branch: {
        name: "Chase",
        country: "United Kingdom"
    },

    accountActivity: {
        totalTransactions: 100,
        incomingTransactions: 21,
        outgoingTransactions: 10,
        totalTransactions: 31,
        lastTransactionDate: "2026-05-28",
        
    },

    cardHistory: {
        activeCards: 4,
        replacementCards: 0,
        lostCardsReported: 0,
        stolenCardsReported: 0
    },

    security: {
        failedLoginAttempts: 4,
        passwordResets: 10,
        suspiciousLoginDetected: false,
       
    }
};

export default accountDetails;