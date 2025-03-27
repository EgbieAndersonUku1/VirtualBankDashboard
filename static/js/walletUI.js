import { Wallet } from "./wallet.js";
import { BankAccount } from "./bankAccount.js";
import { profileCache } from "./formUtils.js";
import { handlePinShowage, handlePinFormSubmission, handlePinFormClosure } from "./pin.js";
import { handleCardFormSubmission, showCardInUIWallet } from "./add-new-card.js";
import { logError } from "./logger.js";
import { config } from "./config.js";
import { getCombinedCode as combineFirstAndLastName, checkIfHTMLElement, toTitle } from "./utils.js";
import { Card } from "./card.js";
import { removeCardTable, cards } from "./cardsComponent.js";
import { AlertUtils } from "./alerts.js";
import { notificationManager } from "./notificationManager.js";




const cardDisplayArea  = document.getElementById("cards");

const walletNameElement             = document.querySelector(".wallet__holder-name");
const walletTotalsCardAmountElement = document.querySelector(".wallet__cards-amount");
const walletTotalCardsElement       = document.querySelector(".wallet__total-cards");
const walletAmountElement           = document.querySelector(".wallet__bank-amount");
const walletLastTransferElement     = document.querySelector(".wallet__last-transfer");
const walletLastReceivedElement     = document.querySelector(".wallet__last-received");
const walletNumCardsAddedElement    = document.querySelector(".wallet__num-of-cards");
const removeCardButtonElement       = document.getElementById("removalCardButton");
const removableSelectableCardsDiv   = document.getElementById("selectable-cards");
const spinnerElement                = document.getElementById("spinner");





validatePageElements();


profileCache.setStorageKey(config.PROFILE_KEY);
notificationManager.setKey(config.NOTIFICATION_KEY);


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
    handlePinShowage(e, wallet);
    handlePinFormClosure(e);
    handlePinFormSubmission(e, wallet)
    
}


export function handleAddNewCard(e) {
    handleCardFormSubmission(e, wallet);
}


function loadUserCardsInUI(wallet) {
    const cards = wallet.getAllCards(); 

    cardDisplayArea.innerHTML = "";

    for (const cardNumber in cards) {

        const card      = cards[cardNumber];
        const cardData  = prepareCardData(card);
        showCardInUIWallet(cardData, cardDisplayArea);
        
    }
    
}



export function prepareCardData(card)  {
    if (!(card instanceof Card)) {
        logError("prepareCardData", "Card data is not an object");
        return
    }
    const cardData      = card.toJson();
    cardData.bankName   = "EUSBC";
    cardData.cardAmount = formatCardBalance(card);
    cardData.cardName   = card.cardHolderName;
    return cardData;
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
        const fullName                = combineFirstAndLastName(toTitle(profile.firstName), toTitle(profile.surname));
        walletNameElement.textContent = fullName;
    } catch (error) {
        walletNameElement.textContent = "User";
    }
   
}


/**
 * Handles the click event on a card element to toggle its removal state.
 * 
 * When a card is clicked, it is either marked for removal or unmarked. The function:
 * - Identifies the clicked card element.
 * - Retrieves the associated card data from the wallet.
 * - Toggles the "highlight-removable-box" class to visually indicate selection.
 * - Adds or removes the card from the removal table accordingly.
 * - Updates the wallet's removal state for the card.
 * 
 * @param {Event} e - The click event object.
 */
export function handleCardRemovalClick(e) {
    const EXPECTED_CLASS = ".bank-card"

    const parent          = e.target.closest(EXPECTED_CLASS);
    const cardNumberClass = ".card-account-number";

    if (parent) {

        const cardNumberElement = parent.querySelector(cardNumberClass);
        const card              = wallet.getByCardNumber(cardNumberElement.textContent.trim());
        const isClicked         = parent.classList.toggle("hightlight-removable-box");

        if (isClicked && cardNumberElement) {
            removeCardTable.appendRow(card);
            wallet.markCardForRemoval(card.cardNumber);
        } else {
            removeCardTable.removeRow(card);
            wallet.markCardForRemoval(card.cardNumber);
        }
    }
  
}



/**
 * Handles the click event on the remove card button.
 * 
 * This function:
 * - Checks if the clicked element is the removal button.
 * - Displays an alert if no cards are available for removal.
 * - Shows a confirmation prompt before proceeding with removal.
 * - If confirmed, removes all marked cards from the wallet.
 * - Updates the UI, including the removal table and dashboard text.
 * - Sends a notification indicating the number of cards removed.
 * 
 * @param {Event} e - The click event object.
 * @returns {Promise<void>} - An asynchronous function that handles the removal process.
 */
export async function handleRemoveCardButtonClick(e) {
    const REMOVAL_BUTTON_ID = "removalCardButton";
    
    if (e.target.id === REMOVAL_BUTTON_ID) {
    
        if (wallet.numOfCardsInWallet === 0) {
            AlertUtils.showAlert({title: "Nothing to remove",
                                 text: "You have no cards to remove",
                                 icon: "info",
                                 confirmButtonText: "Ok",
            })
            return;
        }

      const resp = await AlertUtils.showConfirmationAlert();

      if (resp) {
          const [isRemoved, cardNumbers] = wallet.removeAllCardsMarkedForRemoval();

    
          if (isRemoved) {
                removeCardTable.upateCellPosition(cardNumbers);
                const cardsToRemoveElements = cards.createCardsToRemove(wallet);
                cards.placeCardDivIn(removableSelectableCardsDiv, cardsToRemoveElements, true);
                loadUserCardsInUI(wallet);
                updateAllWalletDashoardText(wallet);
                const cardsRemoved = wallet.maximumCardsAllow - wallet.numOfCardsInWallet;
                notificationManager.add(`You have removed a total of  ${cardsRemoved} from your wallet.`);
                        
            } 
          
      }
  
    }
}


function validatePageElements() {
    checkIfHTMLElement(walletNameElement, "The wallet holder name element for wallet dashboard");
    checkIfHTMLElement(walletTotalsCardAmountElement, "The total card element for wallet dashboard");
    checkIfHTMLElement(walletAmountElement, "The bank amount element for wallet dashboard");
    checkIfHTMLElement(walletLastTransferElement, "The last transfer element for wallet dashboard");
    checkIfHTMLElement(walletLastReceivedElement, "The last received element for wallet dashboard");
    checkIfHTMLElement(walletNumCardsAddedElement, "The number of cards added element for wallet dashboard");
    checkIfHTMLElement(walletTotalCardsElement, "The total amount of cards e.g 1/3 element");
    checkIfHTMLElement(removeCardButtonElement, "The remove card button");
    checkIfHTMLElement(removableSelectableCardsDiv, "Removable cards div");
    checkIfHTMLElement(spinnerElement, "The spinner element");
}
