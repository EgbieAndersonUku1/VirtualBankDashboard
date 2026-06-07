/**
 * Card Request Information Configuration
 *
 * This file defines the dataset used for card request simulation and processing.
 *
 * It acts as the single source of truth for card-related inputs used throughout the system,
 * including card issuance details, delivery information, and user-provided request data.
 *
 * The values in this object are intentionally structured to be manually editable in order
 * to simulate different card request scenarios and observe their impact on both:
 *
 * 1. Risk analysis outcomes (decision logic, scoring, rule evaluation)
 * 2. UI rendering (displayed card request details in the frontend)
 *
 * This configuration is not intended to contain business logic or computed values.
 * All processing, validation, and analysis are handled elsewhere in the application.
 */



export const cardType = Object.freeze({
    VISA: "Visa Debit",
    MASTERCARD: "Mastercard",
    DISCOVER: "Discover",
    CREDIT_CARD: "Visa Credit"
});


export const cardVariant = Object.freeze({
    PHYSICAL_CARD: "Physical Card",
    VIRTUAL_CARD: "Virtual Card",
    TEMPORARY: "Temporary Card",
    REPLACEMENT: "Replacement Card",
    UPGRADE: "Card Upgrade",
    NEW_CARD: "New card"
});



export const cardStatus = Object.freeze({
    APPROVED: "Approved",
    UNDER_REVIEW: "Under review",
    REJECTED: "Rejected",
    PENDING: "Pending",
    WITHDRAWN: "Withdrawn"
});



// manipulate object to alter the risk outcome and render the new values to the frontend
export const cardRequestInformation = {

    fullName: "Jake Thompson",
    cardType: cardType.VISA,
    cardVariant: cardVariant.PHYSICAL_CARD,
    phoneNumber: "+44 07214405252",

    DeliveryAddress: {
        line1: "46 Albert Square",
        line2: "",
        county: "Waltford",
        city: "London",
        postCode: "E20 6PQ",
        specialInstructions: `Please leave the card in a secure location if no one is home.
                                Ring the doorbell twice and wait for 2 minutes.
                                If delivery fails, reattempt the next working day between 9am–6pm.
                                `
    }
}

export default cardRequestInformation;