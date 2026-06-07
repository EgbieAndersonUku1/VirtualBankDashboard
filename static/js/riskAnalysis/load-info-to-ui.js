import accountDetails from "./account/accountDetails.js";
import profileInformationDetails from "./account/profileInfoDetails.js";
import { deselectAllTabs, highlightTab } from "../utils/tab-utils.js";
import { formatDate, formatCurrency, getLastFourDigits, sanitizeText } from "../utils.js";
import { warnError } from "../logger.js";
import cardRequestInformation from "./account/cardRequestDetails.js";
import { db } from "./db.js";
import { updateTable } from "./table.js";
import { clearDivElement } from "./rules/utils.js";
import { statusClassMap } from "./handleRequestBtns.js";
import { renderTable } from "./table.js";




const tabs                = document.querySelectorAll(".tabs .tab")
const requestTabContainer = document.getElementById("tabs");
const requestTabContents  = document.querySelectorAll(".request-tab-content");
const firstTabContent     = document.getElementById("request-first-tab");
const secondTabContent    = document.getElementById("request-second-tab")



requestTabContainer.addEventListener("click", handleDelegation);


document.addEventListener("DOMContentLoaded", () => {
        populateTopCard();
        populateCardRequestDetails();
        populateAccountInformation();
        populatePersonalInformation();

        showFirstTab();

        populateTableData();
});


/**
 * Handles tab click delegation and activates the corresponding tab content.
 */
function handleDelegation(e) {

    const id = e.target.dataset.tab;
    const tab = e.target;

    switch (id) {
        case "request-first-tab":
            activateTab(tab, firstTabContent);
            break;

        case "request-second-tab":
            activateTab(tab, secondTabContent);
            break;
    }
}



/**
 * Populates the top profile summary card with key user details.
 */
function populateTopCard() {
    loadProfileDataToTopCard();
}




/**
 * Populates all card request related UI fields.
 */
function populateCardRequestDetails() {
    loadCardType();
    loadCardVariant();
    loadAccountType();
    loadSortCode();
    loadAccountNumber();
    loadCardBalance();
    loadRequestCardAddress();
    loadRequestPhoneNumber();
    loadSpecialInstructions();
}

/**
 * Populates all account-related UI fields.
 */
function populateAccountInformation() {
    loadCreationDate();
    loadKYCStatus();
    loadBalance();
    loadNumOfAccounts();
    loadNumOfCards();
    loadTotalTransactions();
}


/**
 * Populates all personal information UI fields.
 */
function populatePersonalInformation() {
    loadFullName();
    loadEmailAddress();
    loadPhoneNumber();
    loadNationality();
    loadPreferredLanguage();
    loadPassport();
    loadAddress();
}


/**
 * Displays the requested card type.
 */
function loadCardType() {
    setText("card-request-details__card-type", cardRequestInformation.cardType || "N/A");
}


/**
 * Displays the requested card variant.
 */
function loadCardVariant() {
    setText("card-request-details__card-variant", cardRequestInformation.cardVariant || "N/A");
}


/**
 * Displays the masked account number (last 4 digits only).
 */
function loadAccountNumber() {
    const accountNumber = safeNumber({ value: accountDetails.accountNumber });
    setText("request-accountNumber", getLastFourDigits(accountNumber.toString()) || "N/A");
}


/**
 * Displays the masked sort code (last 4 digits only).
 */
function loadSortCode() {
    const sortCode = safeNumber({ value: accountDetails.sortCode, context: "loadSortCode" });
    setText("request-sortcode", getLastFourDigits(sortCode.toString()) || "N/A");
}


/**
 * Displays the account type.
 */
function loadAccountType() {
    setText("request__account-type", accountDetails.accountType || "N/A");
}


/**
 * Displays the available card balance.
 */
function loadCardBalance() {
    setText("card-balance", safeBalance(accountDetails.balance.available) || "N/A");
}


/**
 * Displays the delivery address for the requested card.
 */
function loadRequestCardAddress() {
    const address = cardRequestInformation.DeliveryAddress;

    setText("request-card__address1", address.line1, "N/A");
    setText("request-card__address2", address.line2);
    setText("request-card__city", address.city, "N/A");
    setText("request-card__county", address.county, "N/A");
    setText("request-card__postcode", address.postCode, "N/A");
    setText("request-card__country", address.country, "N/A");
}


/**
 * Displays the phone number for the card request.
 */
function loadRequestPhoneNumber() {
    const cleanedPhoneNumber = cleanPhoneNumber(cardRequestInformation.phoneNumber);
    setText("request-phoneNumber", cleanedPhoneNumber || "N/A");
}


/**
 * Displays the delivery special instructions (truncated to 255 characters).
 */
function loadSpecialInstructions() {
    setText(
        "special-instructions",
        cardRequestInformation.DeliveryAddress.specialInstructions.toString().slice(0, 255) || "N/A"
    );
}


/**
 * Displays the account creation date.
 */
function loadCreationDate() {
    setText("creation-date", formatDate(accountDetails.accountCreationDate) || "N/A");
}


/**
 * Displays the KYC verification status level.
 */
function loadKYCStatus() {
    setText("KYC-status-value", accountDetails.kycStatus.level);
}


/**
 * Displays the available account balance.
 */
function loadBalance() {
    setText("balance-value", safeBalance(accountDetails.balance.available) || "N/A");
}


/**
 * Displays the total number of accounts.
 */
function loadNumOfAccounts() {
    setText(
        "total-accounts-value",
        safeNumber({ value: accountDetails.numberOfAccounts, context: "loadNumOfAccounts" })
    );
}


/**
 * Displays the total number of active cards.
 */
function loadNumOfCards() {
    setText(
        "total-cards-value",
        safeNumber({ value: accountDetails.cardHistory.activeCards, context: "loadNumOfCards" })
    );
}



/**
 * Displays the total number of account transactions.
 */
function loadTotalTransactions() {
    setText(
        "transactions-value",
        safeNumber({ value: accountDetails.accountActivity.totalTransactions, context: "loadTotalTransactions" })
    );
}


/**
 * Displays the user's full name.
 */
function loadFullName() {
    setText("fullName", profileInformationDetails.fullName || "N/A");
}


/**
 * Displays the user's delivery address.
 */
function loadAddress() {
    const address = profileInformationDetails.DeliveryAddress;

    setText("address1", address.line1, "N/A");
    setText("address2", address.line2);
    setText("city", address.city, "N/A");
    setText("county", address.county, "N/A");
    setText("postcode", address.postCode, "N/A");
    setText("country", address.country, "N/A");
}

/**
 * Displays the user's phone number and its verification status.
 */
function loadPhoneNumber() {
    const phoneNumber = profileInformationDetails.phoneNumber.value.toString();
    const cleanedPhoneNumber = cleanPhoneNumber(phoneNumber);

    setText("phoneNum", cleanedPhoneNumber || "N/A");
    checkIfVerified("is-phone-num-verified", phoneNumber);
}


/**
 * Displays the user's email address and its verification status.
 */
function loadEmailAddress() {
    const email = profileInformationDetails.email;
    setText("email-address", email?.value || "N/A");
    checkIfVerified("is-email-verified", email);
}


/**
 * Displays the user's nationality.
 */
function loadNationality() {
    setText("nationality", profileInformationDetails.nationality || "N/A");
}


/**
 * Displays the user's preferred language.
 */
function loadPreferredLanguage() {
    setText("preferred-language", profileInformationDetails.preferredLanguage || "N/A");
}


/**
 * Displays the user's passport value in a masked format and its verification status.
 */
function loadPassport() {
    const passport = profileInformationDetails.passport;
    let cleanedPassportValue;
    const MAX_LENGTH = 16;

    if (passport.value) {
        cleanedPassportValue = sanitizeText(passport.value, true, false);
    }

    if (cleanedPassportValue) {
        const maskedNumber = `*`.repeat(8) + cleanedPassportValue;
        cleanedPassportValue = maskedNumber.slice(0, MAX_LENGTH);
    }

    setText("passport", cleanedPassportValue || "N/A");
    checkIfVerified("is-passport-verified", passport);
}


/**
 * Displays the user's basic profile information on the top card (name and email).
 */
function loadProfileDataToTopCard() {
    setText("profile-name", profileInformationDetails.fullName || "N/A");
    setText("profile-email", profileInformationDetails.email.value.toLowerCase() || "N/A");
}



/**
 * Populates the table data when the page loads
 */
function populateTableData() {

    const tableBody = document.getElementById("card-requests-tbody")
    renderTable(db)
   
  
}


/**
 * Cleans and normalises a phone number string for display.
 * Ensures valid string input, sanitises characters, and formats UK numbers if applicable.
 * Limits output length to 15 characters.
 */
function cleanPhoneNumber(phoneNumber) {

    if (typeof phoneNumber !== "string") {
        warnError("cleanPhoneNumber", {
            error: "The phone number must be a string",
            receivedType: typeof phoneNumber
        });
        return;
    }

    let cleanedPhoneNumber = sanitizeText(phoneNumber, true, false);

    if (cleanedPhoneNumber) {
        if (phoneNumber.startsWith("+44")) {
            cleanedPhoneNumber = `+${cleanedPhoneNumber}`;
        }
    }

    return cleanedPhoneNumber.slice(0, 15);
}


/**
 * Safely formats a balance value into a currency string.
 * Returns undefined if formatting fails.
 */
function safeBalance(balance) {
    let value;

    try {
        value = formatCurrency(balance.toString());
    } catch (error) {
        warnError("safeBalance", {
            error: `Invalid balance value provided. Expected a number but received a non-numeric value. Defaulting to "N/A".`,
            extraInfo: error.message,
        });
    }

    return value;
}



/**
 * Updates a verification status badge in the UI based on a profile field.
 * Sets text and styling for verified or not verified states.
 */
function checkIfVerified(id, profileValue) {

    const verificationSpanElement = document.getElementById(id);
    if (!verificationSpanElement) return;

    verificationSpanElement.classList.remove("status--approved", "status--rejected");

    if (profileValue?.verified) {
        verificationSpanElement.textContent = "Verified";
        verificationSpanElement.classList.add("status", "status--approved");
    } else {
        verificationSpanElement.textContent = "Not Verified";
        verificationSpanElement.classList.add("status", "status--rejected");
    }

    verificationSpanElement.classList.add("capitalise");
}


/**
 * Sets the text content of an element by ID.
 * Falls back to an empty string if no value is provided.
 */
function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value || "";
}



/**
 * Activates a tab and displays its associated content panel.
 *
 * @param {HTMLElement} tab - The tab element to activate.
 * @param {HTMLElement} tabContent - The content panel to display.
 */
function activateTab(tab, tabContent) {
    deselectAllTabs(tabs);
    highlightTab(tab);
    hideAllTabContent();
    showTabContent(tabContent);
}


/**
 * Hides all tab content sections.
 */
function hideAllTabContent() {
    requestTabContents.forEach((tabContent) => {
        tabContent.style.display = "none";
    });
}

/**
 * Displays a specific tab content section.
 */
function showTabContent(tabConent) {
    tabConent.style.display = "block";
}

/**
 * Automatically activates and shows the first available tab.
 */
function showFirstTab() {
    if (Array.from(tabs).length > 0) {
        const firstTab = tabs[0];
        activateTab(firstTab, firstTabContent);
    }
}

/**
 * Safely returns a numeric value or a fallback if invalid.
 */
function safeNumber({ value, fallback = "N/A", context = "" }) {
    if (typeof value !== "number") {
        warnError(context, {
            error: `Expected number but got ${typeof value}`
        });
        return fallback;
    }
    return value;
}