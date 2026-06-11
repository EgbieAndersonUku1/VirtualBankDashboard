import accountDetails from "./account/accountDetails.js";
import profileInformationDetails from "./account/profileInfoDetails.js";
import { deselectAllTabs, highlightTab } from "../utils/tab-utils.js";
import { formatCurrency, sanitizeText, getLastFourDigits, formatMaskedAccountNumber } from "../utils.js";
import { badgeConfig } from "./badge.config.js";
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
const secondTabContent    = document.getElementById("request-second-tab");
const thirdTabContent     = document.getElementById("request-third-tab")



requestTabContainer.addEventListener("click", handleDelegation);




document.addEventListener("DOMContentLoaded", () => {
        populateTopCard();
        populateCardRequestDetails();
        populateAccountInformation();
        populatePersonalInformation();
        populateUserAccountDetails();
        populateBankDetails.load();

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
        
        case "request-third-tab":
            activateTab(tab, thirdTabContent);
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
    setText("creation-date", accountDetails.accountCreationDate || "N/A");
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
    updateVerificationStatusBadge({id: "is-phone-num-verified", 
                                  valueToCheck: profileInformationDetails.phoneNumber.verified, 
                                  activeStatusText: "Verified", 
                                  nonActiveStatusText: "Not verified"});
}


/**
 * Displays the user's email address and its verification status.
 */
function loadEmailAddress() {
    const email = profileInformationDetails.email;
    setText("email-address", email?.value || "N/A");
    updateVerificationStatusBadge({id: "is-email-verified", 
                                  valueToCheck: email.verified,
                                   activeStatusText: badgeConfig.verified.text, 
                                   nonActiveStatusText: badgeConfig.unverified.text 
                                });
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
    updateVerificationStatusBadge({id: "is-passport-verified", 
                                  valueToCheck: passport.verified, 
                                  activeStatusText: "Verified",
                                   nonActiveStatusText: "Not verified"});

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
function updateVerificationStatusBadge({id, 
                                        valueToCheck, 
                                        activeStatusText, 
                                        nonActiveStatusText,
                                        activeClass=badgeConfig.active.class,
                                        nonActiveClass=badgeConfig.deactivated.class,
                                         }) {
    const verificationSpanElement = document.getElementById(id);
    if (!verificationSpanElement) return;

    if (typeof valueToCheck !== "boolean"){
        warnError("updateVerificationStatusBadge", {
            error: `valueTocheck must be a boolean`,
            received: `Value type received ${valueToCheck}`
        })
        return;
    }

    verificationSpanElement.classList.remove(activeClass, nonActiveClass);

    if (valueToCheck) {
        verificationSpanElement.textContent = activeStatusText;
        verificationSpanElement.classList.add("status", activeClass);
    } else {
        verificationSpanElement.textContent = nonActiveStatusText;
        verificationSpanElement.classList.add("status", nonActiveClass);
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




/**
 * Load the profile user account details
 */
function populateUserAccountDetails() {
    setText("bank-details__sortcode-value", formatMaskedAccountNumber(accountDetails.sortCode?.toString()));
    setText("bank-details__account-num-value", formatMaskedAccountNumber(accountDetails.accountNumber?.toString()));
    setText("bank-details__balance-value", formatCurrency(accountDetails.balance?.available))
    updateVerificationStatusBadge({id: "bank-details__is-verified", 
                                    valueToCheck: accountDetails.status.active, 
                                    activeStatusText: badgeConfig.active.text, 
                                    nonActiveStatusText: badgeConfig.deactivated.text})
}




/**
 * Populate the bank and account detains
 */
const populateBankDetails = (() => {

    function populateBankAddress() {
        const bankAddress = accountDetails.bank.address;
      
        setText("branch-address-line1", bankAddress.line1);
        setText("branch-address-line2", bankAddress.line2);
        setText("branch-city", bankAddress.city);
        setText("branch-country", bankAddress.country)
        setText("branch-postcode", bankAddress.postCode)

    }

    function populateAccountType() {
        setText("account-type", accountDetails.accountType)
    }

    function populatePhoneNumber() {
        setText("branch-phone", accountDetails.bank.phoneNumber)
    }

    function populateBranchName() {
        setText("bank-name", accountDetails.bank.name)
    }

    function populateBankBranch() {
        setText("bank-branch", accountDetails.bank.branch)
    }

    function populateBalance() {
        setText("available-balance", formatCurrency(accountDetails.balance.available))
    }

    function populateCurrencySymbol() {
        setText("account-currency-symbol", accountDetails.balance.currencyLabel)
    }

    function populateCurrency() {
        setText("account-currency-code", accountDetails.balance.currency)
    }

    function populateAccountStatus() {
        const id = "account-status"
        setText(id, accountDetails.status.active)
        updateVerificationStatusBadge({
            id: id,
            valueToCheck: accountDetails.status.active,
            activeStatusText: "Active",
            nonActiveStatusText: "Deactivated",

        })
    }

    function populateOverdraft() {
        setText("account-overdraft", formatCurrency(accountDetails.overdraft.limit))
    }

    function load() {
        populateBankAddress();
        populatePhoneNumber();
        populateBranchName()
        populateBankBranch();
        populateBalance();
        populateCurrencySymbol();
        populateCurrency();
        populateAccountStatus();
        populateOverdraft();
        populateAccountType();
    }

    return {
        load
    };

})();

