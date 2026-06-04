/**
 * Profile Information Configuration
 *
 * This file defines the user's personal profile dataset used throughout the system.
 *
 * It acts as the single source of truth for personal identity information such as
 * contact details, address, identification documents, and preferences.
 *
 * The values in this object are intentionally designed to be manually editable in order
 * to simulate different user profiles and observe how changes affect:
 *
 * 1. Risk analysis outcomes (identity verification, rule evaluation, scoring inputs)
 * 2. UI rendering (displayed personal information across the frontend)
 *
 * This file contains static configuration data only and should not include business logic
 * or computed values. All validation, processing, and analysis are handled elsewhere.
 */


const profileInformationDetails = {

    fullName: "Jake Thompson",

    phoneNumber: {
        value: "+44 7700 900123",
        verified: false
    },

    DeliveryAddress: {
        line1: "Greenlight Productions Studio",
        line2: "5 Abbey Road",
        city: "Windsor",
        county: "Berkshire",
        postCode: "SL4 1QF",
        country: "United Kingdom"
    },

    email: {
        value: "jakeThompson@gmail.com",
        verified: false
    },

    passport: {
        value: "4554",
        verified: false
    },

    nationality: "Timelord",

    preferredLanguage: "English (UK)"
}


export default profileInformationDetails