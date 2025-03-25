import { Wallet } from "./wallet.js";
import { BankAccount } from "./bankAccount.js";


import { handlePinShowage, handlePinFormSubmission, handlePinFormClosure } from "./pin.js";
import { handleCardFormSubmission, showCardInUIWallet } from "./add-new-card.js";
import { getLocalStorage } from "./db.js";
import { logError } from "./logger.js";
import { config } from "./config.js";
const cardDisplayArea  = document.getElementById("cards")

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

