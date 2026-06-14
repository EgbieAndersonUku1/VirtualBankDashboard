/**
 * Recent Transactions Configuration
 *
 * This file defines the dataset used for simulating and rendering recent card-related transactions
 * within the application.
 *
 * It acts as the single source of truth for transaction history data used by the UI layer,
 * particularly in components responsible for displaying transaction cards and summaries.
 *
 * The dataset is intentionally structured as static, manually editable mock data to allow
 * simulation of different transaction scenarios, including varying:
 *
 * 1. Transaction types (e.g. card request, replacement, loss, theft, activation)
 * 2. Monetary values associated with each transaction
 * 3. Historical dates for ordering and display logic
 *
 * New transactions can be added by inserting additional objects into the `transactions` array
 * following the same structure:
 *
 * {
 *   title: "Transaction Title",
 *   description: "Transaction Description",
 *   amount: 0.00,
 *   date: "YYYY-MM-DD"
 * }
 * 
 * Note:
 * The cutoff point for the **description** is 100 characters meaning only the first hundred characters is shown
 *
 * This configuration is used primarily for UI rendering and development/testing purposes.
 *
 * It does not contain any business logic, validation, or computation.
 * All processing, transformation, and analysis of transaction data is handled elsewhere in the system.
 */


export const recentTransactions = {
    transactions: [
        {
            title: "Card Request Fee",
            description: "Card Request Transaction",
            amount: 0.00,
            date: "2025-06-13"
        },
        {
            title: "Replacement Card Fee",
            description: "Card Replacement Transaction",
            amount: 5.00,
            date: "2025-06-10"
        },
        {
            title: "Lost Card Fee",
            description: "Lost Card Replacement Charge",
            amount: 7.50,
            date: "2025-06-08"
        },
        {
            title: "Stolen Card Fee",
            description: "Emergency Card Replacement",
            amount: 10.00,
            date: "2025-06-05"
        },

         {
            title: "Wrong card sent",
            description: "The card sent was the wrong card type. Client was sent a visa card instead of a mastercard",
            amount: 0.00,
            date: "2025-06-04"
        },

        {
            title: "Card problem",
            description: "The pin is not working",
            amount: 0.00,
            date: "2025-06-02"
        },

        {
            title: "Card Activation Fee",
            description: "New Card Activation",
            amount: 2.00,
            date: "2025-06-01"
        }
    ]
};