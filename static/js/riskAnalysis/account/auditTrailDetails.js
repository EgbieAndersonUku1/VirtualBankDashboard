/**
 * Audit Trail Details Configuration
 *
 * This file defines the dataset used for simulating and displaying audit trail activity
 * across card request and account lifecycle events.
 *
 * It acts as a single source of truth for audit entries used throughout the system,
 * including user actions, system events, status changes, and verification steps.
 *
 * Each audit record is structured to represent a chronological event in the lifecycle
 * of a card request, from submission through approval and dispatch.
 *
 * The values in this object are intentionally structured to be manually editable in order
 * to simulate different audit scenarios and observe their impact on:
 *
 * 1. Audit trail UI rendering (timeline, event grouping, and activity feed display)
 * 2. Event sequencing and lifecycle visibility (how actions appear over time)
 * 3. System behaviour representation (user vs system actions, status transitions)
 *
 * This configuration is not intended to contain business logic or computed values.
 * All processing, validation, formatting, and analysis are handled elsewhere in the application.
 */



import profileInformationDetails from "./profileInfoDetails.js";
import accountDetails from "./accountDetails.js";
import { formatMaskedAccountNumber } from "../../utils.js";


export const auditEventType = Object.freeze({
    CARD_REQUEST_SUBMITTED: "Card request submitted",
    REQUEST_STATUS_CHANGED: "Request status changed",
    USER_INFORMATION_VIEWED: "User information viewed",
    ACCOUNT_DETAILS_ACCESSED: "Account details accessed",
    KYC_VERIFIED: "Kyc verified",
    CARD_REQUEST_APPROVED: "Card request approved",
    CARD_REQUEST_REJECTED: "Card request rejected",
    CARD_QUEUED_FOR_DISPATCH: "Card queued for dispatch",
    CARD_DISPATCHED: "Card dispatched",
    SMS_NOTIFICATION_SENT: "Sms notification sent",
    EMAIL_NOTIFICATION_SENT: "Email notification sent"
});


const name = profileInformationDetails.fullName;

export const AuditTrailDetails = {
    audit: [
        {
            event: auditEventType.CARD_REQUEST_SUBMITTED,
            description: `${name} submitted a request for Visa Debit card`,
            performedBy: `${name}`,
            channel: "Web",
            date: "2026-05-26",
            time: "16:18",
            metadata: {
                currentStatus: "Pending",
                
            }
        },
        {
            event: auditEventType.REQUEST_STATUS_CHANGED,
            description: "Status changed from Pending to Under Review",
            performedBy: "John Wicks (Top head hunter manager)",
            date: "2026-05-26",
            time: "16:22",
            metadata: {
                currentStatus: "Under Review"
            }
        },
        {
            event: auditEventType.USER_INFORMATION_VIEWED,
            description: "User profile and account details viewed",
            performedBy: "John Wicks (Top head hunter manager)",
            date: "2026-05-26",
            time: "16:23",
            metadata: {
                currentStatus: "Under Review"
            }
        },
        {
            event: auditEventType.ACCOUNT_DETAILS_ACCESSED,
            description: `Account ${formatMaskedAccountNumber(accountDetails.accountNumber)} details accessed`,
            performedBy: "John Wicks (Top head hunter manager)",
            date: "2026-05-26",
            time: "16:26",
            metadata: {
                currentStatus: "Under Review"
            }
        },
        {
            event: auditEventType.KYC_VERIFIED,
            description: "User identity and documents verified successfully",
            performedBy: "John Wicks (Top head hunter manager)",
            date: "2026-05-27",
            time: "09:05",
            metadata: {
                currentStatus: "Under Review"
            }
        },
        {
            event: auditEventType.CARD_REQUEST_APPROVED,
            description: "Visa Debit card request approved",
            performedBy: "John Wicks (Top head hunter manager)",
            date: "2026-05-27",
            time: "09:12",
            metadata: {
                currentStatus: "Approved"
            }
        },
        {
            event: auditEventType.REQUEST_STATUS_CHANGED,
            description: "Status changed from Under Review to Approved",
            performedBy: "John Wicks (Top head hunter manager)",
            date: "2026-05-27",
            time: "09:13",
            metadata: {
                newStatus: "Approved"
            }
        },
        {
            event: auditEventType.CARD_QUEUED_FOR_DISPATCH,
            description: "Card added to dispatch queue",
            performedBy: "System",
            date: "2026-05-27",
            time: "09:20",
             metadata: {
                newStatus: "Approved"
            }
        },
        {
            event: auditEventType.SMS_NOTIFICATION_SENT,
            description: "Card approval notification sent to user",
            performedBy: "System",
            date: "2026-05-27",
            time: "09:21",
            metadata: {
                newStatus: "Approved"
            }
        }
    ]
};