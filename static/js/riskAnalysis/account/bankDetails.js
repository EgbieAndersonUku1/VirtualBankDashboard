/**
 * Bank Details Configuration
 *
 * This file defines the core bank dataset used throughout the application.
 *
 * It acts as the single source of truth for both:
 * 1. UI rendering (displayed values in the frontend such as a bank, bank name, address,e tc
 *
 * These values are intentionally designed to be manually edited within this object
 * to simulate different user scenarios. Any changes will immediately be reflected in
 * UI.
 *
 * This file contains only static data and should not include any business logic or
 * computational functions. All processing is handled elsewhere in the system.
 */

export const bankNames = Object.freeze({

    CAPITAL_BANK:  "Example Bank Central Branch",
    EXAMPLE_BANK:  "North Branch",
});



export const bankDetails = {

    branches: {
       [bankNames.EXAMPLE_BANK]: {
            address: {
                line1: "123 Example Street",
                line2: "Flat 4B",
                city: "London",
                county: "Greater London",
                postCode: "AB12 3CD",
                country: "United Kingdom",
            },
            phoneNumber: "02074850120",
            brahch: "Chase",
            name: "Croatoan"
        },

        [bankNames.EXAMPLE_BANK]: {
            address: {
                line1: "1 Klingon Road",
                line2: "",
                city: "London",
                county: "Greater London",
                postCode: "NW1 2AA",
                country: "United Kingdom",
            },
            phoneNumber: "02079998877",
            branch: "Klingon",
            name: "EUSBC",
        },
    },
};