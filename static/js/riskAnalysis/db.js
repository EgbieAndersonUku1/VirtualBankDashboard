import { cardType, cardVariant, cardStatus } from "./account/cardRequestDetails.js"


// Mock dataset used to populate the card requests table
// add data in the same format to be shown in the table UI
export const db = [

    {
        name: "Jake Thompson",
        account: "6789",
        cardType: cardType.VISA,
        cardVariant: cardVariant.PHYSICAL_CARD,
        status: cardStatus.UNDER_REVIEW,
        date: "06-06-2026",
        time: "9:05pm"
    },
    {
        name: "Jake Thompson",
        account: "6789",
        cardType: cardType.VISA,
        cardVariant: cardVariant.PHYSICAL_CARD,
        status: cardStatus.UNDER_REVIEW,
        date: "06-06-2026",
        time: "9:05pm"
    },
    {
        name: "Jake Thompson",
        account: "6789",
        cardType: cardType.VISA,
        cardVariant: cardVariant.PHYSICAL_CARD,
        status: cardStatus.REJECTED,
        date: "06-06-2026",
        time: "9:05pm"
    },
    {
        name: "Jake Thompson",
        account: "6789",
        cardType: cardType.VISA,
        cardVariant: cardVariant.PHYSICAL_CARD,
        status: cardStatus.APPROVED,
        date: "06-06-2026",
        time: "9:05pm"
    },

    {
        name: "Jake Thompson",
        account: "4444",
        cardType: cardType.VISA,
        cardVariant: cardVariant.PHYSICAL_CARD,
        status: cardStatus.PENDING,
        date: "27-05-2026",
        time: "10:30pm"
    },

    {
        name: "Aisha Khan",
        account: "9821",
        cardType: cardType.MASTERCARD,
        cardVariant: cardVariant.REPLACEMENT,
        status: cardStatus.APPROVED,
        date: "26-05-2026",
        time: "08:12am"
    },

    {
        name: "Michael Brown",
        account: "1209",
        cardType: cardType.VISA,
        cardVariant: cardVariant.REPLACEMENT,
        status: cardStatus.REJECTED,
        date: "25-05-2026",
        time: "04:45pm"
    },

    {
        name: "Sophia Williams",
        account: "7710",
        cardType: cardType.DISCOVER,
        cardVariant: cardVariant.NEW_CARD,
        status: cardStatus.UNDER_REVIEW,
        date: "24-05-2026",
        time: "09:02am"
    },

    {
        name: "Daniel Smith",
        account: "3384",
        cardType: cardType.VISA,
        cardVariant: cardVariant.NEW_CARD,
        status: cardStatus.APPROVED,
        date: "23-05-2026",
        time: "07:18pm"
    },

    {
        name: "Emily Johnson",
        account: "9090",
        cardType: cardType.MASTERCARD,
        cardVariant: cardVariant.PHYSICAL_CARD,
        status: cardStatus.PENDING,
        date: "22-05-2026",
        time: "01:25pm"
    },

    {
        name: "Jane Garcia",
        account: "5621",
        cardType: cardType.VISA,
        cardVariant: cardVariant.UPGRADE,
        status: cardStatus.WITHDRAWN,
        date: "21-05-2026",
        time: "11:40am"
    },

    {
        name: "Peter Garcia",
        account: "5821",
        cardType: cardType.VISA,
        cardVariant: cardVariant.PHYSICAL_CARD,
        status: cardStatus.PENDING,
        date: "21-05-2026",
        time: "06:52pm"
    },

    {
        name: "MacBeth",
        account: "5921",
        cardType: cardType.VISA,
        cardVariant: cardVariant.REPLACEMENT,
        status: cardStatus.APPROVED,
        date: "21-05-2026",
        time: "02:11pm"
    },

    {
        name: "Egbie U",
        account: "7921",
        cardType: cardType.VISA,
        cardVariant: cardVariant.VIRTUAL_CARD,
        status: cardStatus.REJECTED,
        date: "21-05-2026",
        time: "09:48pm"
    }

];





/**
 * Searches card request records using a partial, case-insensitive match.
 *
 * The search is performed across:
 * - Customer name
 * - Account number
 * - Card type
 * - Card variant
 * - Request status
 * - Date and time approved/rejected/withdraw/place on hold
 *
 * @param {string} value - The search query entered by the user.
 * @returns {Array<Object>} Matching card request records.
 */
export function searchDb(value) {
    const query = value.toLowerCase().trim();

    return db.filter((row) => {

        return (
            row.name.toLowerCase().includes(query) ||
            row.account.toLowerCase().includes(query) ||
            row.cardType.toLowerCase().includes(query) ||
            row.cardVariant.toLowerCase().includes(query) ||
            row.status.toLowerCase().includes(query) ||
            row.date.includes(query) ||
            row.time.includes(query)
        );
    });
}