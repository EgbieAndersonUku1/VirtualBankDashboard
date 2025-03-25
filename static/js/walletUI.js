import { Wallet } from "./wallet.js";
import { BankAccount } from "./bankAccount.js";
import { profileCache } from "./formUtils.js";
import { handlePinShowage, handlePinFormSubmission, handlePinFormClosure } from "./pin.js";
import { handleCardFormSubmission, showCardInUIWallet } from "./add-new-card.js";
import { logError } from "./logger.js";
import { config } from "./config.js";
import { getCombinedCode as combineFirstAndLastName, checkIfHTMLElement, getCombinedCode, toTitle } from "./utils.js";

const cardDisplayArea  = document.getElementById("cards");

const walletNameElement             = document.querySelector(".wallet__holder-name");
const walletTotalsCardAmountElement = document.querySelector(".wallet__cards-amount");
const walletTotalCardsElement       = document.querySelector(".wallet__total-cards");
const walletAmountElement           = document.querySelector(".wallet__bank-amount");
const walletLastTransferElement     = document.querySelector(".wallet__last-transfer");
const walletLastReceivedElement     = document.querySelector(".wallet__last-received");
const walletNumCardsAddedElement    = document.querySelector(".wallet__num-of-cards");


validatePageElements();


profileCache.setStorageKey(config.PROFILE_KEY);


let bankAccount;
let wallet;


document.addEventListener("DOMContentLoaded", handleInitialSetup);


function handleInitialSetup() {
    
    console.log("Attempting to retrieve bank account information from localStorage...");

    bankAccount = BankAccount.getByAccount(config.SORT_CODE, config.ACCOUNT_NUMBER);
    
    if (!bankAccount) {
        console.log("Retrieval failed - Bank account not found. Creating a new bank account...");
        bankAccount = BankAccount.createBankAccount(config.SORT_CODE, config.ACCOUNT_NUMBER, config.INITIAL_BALANCE);
    } else {
        console.log("Bank account successfully retrieved from localStorage.");
    }

    if (bankAccount) {
        console.log("Bank account successfully loaded into the system.");
        console.log("Attempting to retrieve linked wallet from localStorage...");
        wallet = Wallet.loadWallet(bankAccount.sortCode, bankAccount.accountNumber);

        if (!wallet) {
            console.log("Retrieval failed - Wallet not found. Creating a new wallet...");
            wallet = Wallet.createWallet(bankAccount, config.PIN, config.INITIAL_BALANCE);
        } else {
            console.log("Wallet successfully retrieved from localStorage and loaded into the system.");
        }
    }

    if (!wallet || !bankAccount) {
        logError("handleInitialSetup", "Failed to load the bank account and wallet.");
        return;
    }

    console.log("Wallet and bank account successfully loaded.");

    loadUserCardsInUI(wallet);
    updateAllWalletDashoardText(wallet)
}



export function handleWalletPin(e) {
    handlePinShowage(e);
    handlePinFormClosure(e);
    handlePinFormClosure(e);
    handlePinFormSubmission(e, wallet)
    
}



export function handleAddNewCard(e) {
    handleCardFormSubmission(e, wallet);
}


function loadUserCardsInUI(wallet) {
    const cards = wallet.getAllCards(); 

    for (const cardNumber in cards) {

        const card          = cards[cardNumber];
        const cardData      = card.toJson()
        cardData.bankName   = "EUSBC";
        cardData.cardAmount = formatCardBalance(card);

        cardData.cardName   = card.cardHolderName;
        showCardInUIWallet(cardData, cardDisplayArea);
        
    }
    
}


/**
 * Formats a card's balance into a currency string (£0.00 format).
 * Ensures that zero balances are displayed correctly and that all amounts have two decimal places.
 *
 * @param {Object} card - The card object containing a balance property.
 * @returns {string} The formatted balance as a string (e.g., "£10.00", "£0.00").
 */
function formatCardBalance(card, currency="£") {
    return `${currency}${card.balance.toFixed(2)}`;
}



export const walletDashboard = {
    updateNumOfCardsText(wallet) {
        walletNumCardsAddedElement.textContent = wallet.numOfCardsInWallet;
        walletTotalCardsElement.textContent    = `${wallet.numOfCardsInWallet}/${wallet.maximumCardsAllow}`;
        console.log(wallet.numOfCardsInWallet)
    },

    updateLastTransferText(wallet) {

    },

    updateLastReceivedText(wallet) {},

    updateTotalCardAmountText(wallet) {},

    updateAccountBalanceText(wallet) {},

    updateWalletDashboardNameText(profile) {}
};


function updateAllWalletDashoardText(wallet) {
    const profile = profileCache.getProfileData();
    walletDashboard.updateNumOfCardsText(wallet);
    
    try {
        const fullName                = getCombinedCode(toTitle(profile.firstName), toTitle(profile.surname));
        walletNameElement.textContent = fullName;
    } catch (error) {
        walletNameElement.textContent = "User";
    }
   
 
}


function validatePageElements() {
    checkIfHTMLElement(walletNameElement, "The wallet holder name element for wallet dashboard");
    checkIfHTMLElement(walletTotalsCardAmountElement, "The total card element for wallet dashboard");
    checkIfHTMLElement(walletAmountElement, "The bank amount element for wallet dashboard");
    checkIfHTMLElement(walletLastTransferElement, "The last transfer element for wallet dashboard");
    checkIfHTMLElement(walletLastReceivedElement, "The last received element for wallet dashboard");
    checkIfHTMLElement(walletNumCardsAddedElement, "The number of cards added element for wallet dashboard");
    checkIfHTMLElement(walletTotalCardsElement, "The total amount of cards e.g 1/3 element")
}
