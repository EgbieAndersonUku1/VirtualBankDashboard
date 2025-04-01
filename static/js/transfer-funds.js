import { checkIfHTMLElement } from "./utils.js";
import { Wallet } from "./wallet.js";
import { config } from "./config.js";
import { cards } from "./cardsComponent.js";
import { warnError, logError } from "./logger.js";
import { handleInputFieldValueLength, toTitle } from "./utils.js";
import { formatCurrency } from "./utils.js";


const transferFormElement                  = document.getElementById("wallet-transfer-form");
const transferButtonElement                = document.getElementById("wallet-transfer-btn");
const transferFromBankSelectElement        = document.getElementById("transfer-from-bank");
const transferToBankSelectOptionElement    = document.getElementById("transfer-to-bank");
const transferToWalletSelectOptionElement  = document.getElementById("transfer-to-wallet");
const transferFromSelectElement            = document.getElementById("transfer-from");
const transferToSelectElement              = document.getElementById("transfer-to");
const cardsAreaElement                     = document.getElementById("wallet-cards");
const accountTypeLabelElement              = document.getElementById("account-balance-type");
const accountTypeAmountLabelElement        = document.getElementById("transfer-card-fund-amount");
const transferCardsCountElement            = document.getElementById("transfer-cards-count");
const transferAmountValueElement           = document.getElementById("transfer-amount-value");
const transferTotalAmountLabelUIElement    = document.getElementById("transfer-total-amount");
const amountPerCardAmount                  = document.getElementById("amount-per-card");
const previewModeElement                   = document.getElementById("preview-mode");
const errorMessageElement                  = document.getElementById("transfer-messages-id");
const cardMessageElement                   = document.getElementById("transfer-error-card-msg-id");


validatePageElements();

transferAmountValueElement.addEventListener("input", handleTransferAmountInputField);
transferAmountValueElement.addEventListener("blur", handleTransferAmountInputField);
transferFromSelectElement.addEventListener("change", handleDisableMatchingTransferOption);
transferToSelectElement.addEventListener("change",   handleTransferToSelectOption);

const transferRecord = {}




// handle functions


/**
 * Handles the selection of the `cards` option from the `to` dropdown.
 * 
 * When the user selects `cards`, this function displays the number of 
 * available cards within the wallet in the UI. If no cards are available, 
 * an empty placeholder is shown instead.
 * 
 * @param {*} e The event object.
 * @returns {void}
 */
export function handleTransferToSelectOption(e) {

    const select = e.target;

    if (select.matches("#transfer-to")) {

       handleCardSelectChange(e);
       handleTransferToWalletOrBankSelectChange(e);
    
       togglePreviewMode();
    }
}



/**
 * Handles the selection of the "card" option in the "transfer to" dropdown.
 * If "cards" is selected, it displays the number of available cards in the wallet.
 * Otherwise, it hides the card selection area.
 *
 * @param {Event} e - The event object containing the selected value.
 * @returns {void}
 */
function handleCardSelectChange(e) {
    const selectValue = e.target.value;

    if (selectValue != "cards") {
        toggleCardAreaDisplay(false);
        return;
    }
  
    toggleCardAreaDisplay(true);

    const cardsToTransferElement = cards.createCardsToShow(transferRecord.wallet);
    cards.placeCardDivIn(cardsAreaElement, cardsToTransferElement, true);
}




/**
 * Handles the selection of the "wallet" or "bank" option in the "transfer to" dropdown.
 * If "either" option is selected, it removes the available cards in the wallet.
 * and allows the user to begin their transference option.
 *
 * @param {Event} e - The event object containing the selected value.
 * @returns {void}
 */
function handleTransferToWalletOrBankSelectChange(e) {
    const selectValue = e.target.value;
    const RESET_VALUE = 0;

    if (selectValue === "bank" || selectValue === "wallet") {

        toggleCardAreaDisplay(false)
        updatePerCountCardValue(RESET_VALUE);
      
        // log the value selected from to side
        transferRecord.transferTo = selectValue;
        handleAccountToAccountTransfer(getTransferAmountValue());
     
    }
}


/**
 * Handles the transfer button click event.
 * 
 * This function ensures that the clicked element is the transfer button.
 * If the form is valid, the transfer process can proceed; otherwise, 
 * the form validity is reported to the user.
 *
 * @param {Event} e - The event object triggered by clicking the button.
 */
export function handleTransferButtonClick(e) {
    const BUTTON_ID = "wallet-transfer-btn";
    if (e.target.id != BUTTON_ID) {
        return;
    }

    if (transferFormElement.checkValidity()) {

    } else {
        transferFormElement.reportValidity();
    }
    
}




/**
 * Handles the selection of a user's card when clicked in the front end.
 * It ensures the selected card belongs to the correct parent container
 * before updating the selection count.
 *
 * @param {*} e - The event object containing the clicked card element.
 */
export function handleTransferCardClick(e) {
    

    const GRAND_PARENT_CLASS_ID = "wallet-cards";
    const CARD_CLASS            = ".bank-card";
  
    const card = e.target.closest(CARD_CLASS);
    
    if (!card || (card && card.parentElement.id != GRAND_PARENT_CLASS_ID)) {
        return;
    }


    validateTransferInput();
    updateCardSelectionCount(card);


}   


/**
 * Handles updates to the transfer amount input field.
 * When the user enters a value, it is automatically updated
 * across various fields and headers that rely on transfer amount field input.
 * 
 * @param {Event} e - The input event triggered by the user.
 * @returns {void}
 */
export function handleTransferAmountInputField(e) {

    const INPUT_FIELD_ID = "transfer-amount-value";
    
    if (e.target.id != INPUT_FIELD_ID) {
        return;
    }

    if (!e.target.value) {
        e.target.value = 0.00
    }

    togglePreviewMode();

    const value     = handleInputFieldValueLength({e:e, convertToFloat:true, returnInputValue:true});
    const cardCount = getTransferCardsCount();

    updateTransferAmountLabelValueUI(value);  

    validateTransferInput();

    if (cardCount > 0) {
        const amount = getTransferCardsCount() * getTransferAmountValue();
        toggleCardFundsStatus(amount, getSelectedAccount());
        updatePerCountCardValue(value);
        return;
    } 

    handleAccountToAccountTransfer(value);

}


/**
 * Handles selection changes in the `transfer from` dropdown.
 * 
 * When the user selects an option (e.g., `bank` or `wallet`), this function:
 * - Retrieves the corresponding balance.
 * - Stores it in the `transferRecord` cache to prevent unnecessary fetches from localStorage 
 *   (since the balance is actually unchanged until user hits transfer buttom) everytime the user switches bewtween `bank` or `wallet` .
 * - Informs the user that there are in preview mode and nothing is permaneantly.
 * - Updates the UI to reflect the selected option.
 * 
 * @param {*} e - The event containing the selected option.
 * @param {*} wallet - The wallet object associated with the user.
 */
function ifTransferFromIsSelectFieldIsClickHandle(e, wallet) {
    const selectValue     = e.target.value;
    let isInPreviewMode   = false;
    const BANK_ID         = "bank";
    const WALLET_ID       = "wallet";

    if (e.target.matches("#transfer-from")) {

        switch(selectValue) {
            case BANK_ID:
                isInPreviewMode = displayTransferBankDetails(wallet);
                break;
            case WALLET_ID:
                isInPreviewMode = displayTransferWalletDetails(wallet);
                break;
        }
       
        if (isInPreviewMode) {
            togglePreviewMode();
        }

        validateAndToggleFundsStatus();
       
        transferRecord.numOfCardsCanFund = 0;
        
    }
}



// display functions


/**
 * Displays the transfer details for a bank account and updates the loaded balance.
 * 
 * This function:
 * - Updates the UI with the bank account balance.
 * - Stores the bank balance in `transferRecord.loadedBalance` cache to keep 
 *   track of the available funds and avoid localStorage lookup.
 * 
 * Note: By design this function overrides the value in `transferRecord.loadedBalance` 
   because the app is only concerned with the balance itself, not its source.*
   and from that balance it will be used to check if the user can transfer funds.
 * 
 * @param {Object} wallet - The wallet object containing the bank balance.
 * @returns {boolean} - Always returns `true` after updating the details.
 */
function displayTransferBankDetails(wallet) {
    displayTransferDetails("Bank Account", wallet.bankAmountBalance);
    transferRecord.loadedBalance = wallet.bankAmountBalance;
    return true;
}



/**
 * Displays the transfer details for the wallet and updates the loaded balance.
 * 
 * This function:
 * - Updates the UI with the wallet account balance.
 * - Stores the wallet balance in `transferRecord.loadedBalance` cache to keep 
 *   track of the available funds and avoid localStorage lookup.
 * 
 * Note: By design this function overrides the value in `transferRecord.loadedBalance` 
   because the app is only concerned with the balance itself, not its source.*
   and from that balance it will be used to check if the user can transfer funds.
 * 
 * @param {Object} wallet - The wallet object containing the bank balance.
 * @returns {boolean} - Always returns `true` after updating the details.
 */
function displayTransferWalletDetails(wallet) {
    
    displayTransferDetails("Wallet Account", wallet.walletAmount);
    transferRecord.loadedBalance = wallet.walletAmount;
    return true;
}



/**
 * Displays the selected account details at the top of the page.
 * 
 * The user can select from two account types: a bank account or a wallet. 
 * Based on the selected option, the corresponding account name and balance 
 * are rendered in the UI.
 * 
 * @param {string} name - The name of the selected account (e.g., "Bank" or "Wallet").
 * @param {string} amount - The account balance to display.
 */
function displayTransferDetails(name, amount) {
    if (!name && !amount) {
        return;
    }

    if (typeof name != "string" && (typeof amount != "string" || typeof amount != "number")) {
        logError("displayTransferDetails", `The name or amount must be a string, but got type name ${typeof name} and type amount ${typeof amount}`);
    }
    accountTypeLabelElement.textContent       = `${toTitle(name)}`;
    accountTypeAmountLabelElement.textContent = `£${amount}`
  
}


function togglePreviewMode(show=true) {
    if (show) {
        previewModeElement.classList.add("show");
        return;
    }
    previewModeElement.classList.remove("show");
    
   
}





/**
 * Updates the number of selected transfer cards in the UI.
 *
 * If the user selects a card, the count increases; if they deselect it, the count decreases.
 * This function ensures that the total transfer amount updates accordingly.
 *
 * @param {HTMLElement} card - The div element representing a transfer card.
 * @throws {Error} Throws an error if the provided card is not a valid HTML element.
 */
function updateCardSelectionCount(card) {
    if (!checkIfHTMLElement(card, "The card to transfer funds to")) {
        throw new Error("The card is not a valid HTML element");
    }

    const currentCardCount = getTransferCardsCount();
    const isSelected       = card.classList.contains("highlight-credit-card");
      
    let newCount;
    

    if (isSelected) {
        newCount = currentCardCount + 1;
    } else {
        newCount  = currentCardCount - 1;
        transferRecord.canFund = true;
      
      
    }

    updateTransferCardCount(newCount);
  
    // Manage transfer amount logic
    const currentTransferAmount = getTransferAmountValue();
    if (currentTransferAmount > 0) {
        updatePerCountCardValue(currentTransferAmount);
    }

    // Calculate the new transfer amount
    const newTransferAmount = currentTransferAmount * newCount;
    updateTransferAmountLabelValueUI(newCount === 0 ? getTransferAmountValue() : newTransferAmount);


    // Reset per-card value when no cards are selected
    if (newCount === 0) {
        updatePerCountCardValue(0);
    }

    const accountType = getSelectedAccount();
    
    if (!isNaN(newTransferAmount)) {
        toggleCardFundsStatus(newTransferAmount, accountType);
    }
     
}


/**
 * Updates the total transfer amount displayed on the UI.
 * The amount is formatted as a string with two decimal places for proper display.
 *
 * @param {string} amount - The amount to be transferred (in string format). Must be a valid numeric string.
 * @throws {Error} If the amount is not a valid string or is empty, an error message is logged and the displayed amount is set to £0.00.
 */
function updateTransferAmountLabelValueUI(amount) {

    if (!amount) {
        const NO_CURRENCY = 0;
        formatCurrency(NO_CURRENCY);
        return;
    }

    if (!(typeof amount === "number" || typeof amount === "string")) {
        warnError("updateTransferAmountLabelValueUI", `The amount passed must be an integer/float or string but got unexpected type: ${typeof amount}`);
         transferTotalAmountLabelUIElement.textContent = formatCurrency("0.00");
        return;
    }
    
    const numberOfCardsSelected = getTransferCardsCount()

    amount = parseFloat(amount).toFixed(2);
   
    if (numberOfCardsSelected > 0) {
        const total                                 = numberOfCardsSelected * getTransferAmountValue();
         transferTotalAmountLabelUIElement.textContent = formatCurrency(total);
        return;
    }

     transferTotalAmountLabelUIElement.textContent =  formatCurrency(amount);
    
        
}


/**
 * Updates the number of cards the user wants to transfer funds to.
 * * 
 * @returns {number} The number of cards selected for the transfer.
 */
function updateTransferCardCount(numOfCards) {
    return transferCardsCountElement.textContent = numOfCards;
   
}


function updateTransferMessageStatus(msg) {
    cardMessageElement.textContent = msg;
}



/**
 * Updates the amount per card displayed on the UI.
 * The amount is formatted as a string with two decimal places for proper display.
 * 
 * @param {number|string} amount - The amount to be displayed per card. Can be a number or a string that can be parsed to a number.
 */
function updatePerCountCardValue(amount) {
    if (!(typeof amount != "number" || typeof amount != "string")) {
        warnError("updatePerCountCardValue", `The amount cannot be empty and must be a integer or a 
                                              string integer. Expected a string integer but got ${typeof amount}
                                              `
                                            );

        amountPerCardAmount.textContent = `£${parseFloat(getTransferAmountValue()).toFixed(2)}`;
        return 
    }
    amountPerCardAmount.textContent = formatCurrency(amount);
}


function handleAccountToAccountTransfer(transferAmount) {
    
    const chosenAccount      = getSelectedAccount();
    const recipientAccount   = transferRecord.transferTo;
  
    if (!chosenAccount || !recipientAccount || isNaN(transferAmount)){
        return; 
    }

    
    let msg;
   
    let canTransfer;             
    const balance                 = formatCurrency(transferRecord.loadedBalance);
    const formattedTransferAmount = formatCurrency(transferAmount);
    let isSuccess                 = false;

  
    canTransfer  = transferRecord.wallet.canTransfer(chosenAccount, transferAmount);
    if (!canTransfer) {
        msg = `You have an available balance of ${balance}, 
               but you're attempting to transfer ${formattedTransferAmount} to your 
                ${recipientAccount}, which exceeds your funds.`;

        toggleErrorMessage(true);
    
       
    } else {
        toggleErrorMessage(false);
        msg       = `You have an available balance of ${balance}, and you can successfully 
                    transfer ${formattedTransferAmount} to your ${recipientAccount}.`;
        isSuccess = true;

    }
    updateTransferMessageStatus(msg);
    toggleTransferMessage(true, isSuccess);
  
   
}


// get functions

function getSelectedAccount() {
    const accountType = accountTypeLabelElement.textContent;

    if (accountType.toLowerCase() === "balance") {
        return;
    }

    if (accountType) {
        return accountType.split(" ")[0].toLowerCase().trim();
    }
}


function getCardLabelDetails() {
    const count = getTransferCardsCount();
    return {
        pluralCards: count > 1 ? "s" : "",
        eachLabel: count > 1 ? "each" : ""
    };
}


/**
 * Retrieves the number of cards the user wants to transfer funds to.
 * 
 * This function extracts the card count from the UI and returns it as a number.
 * 
 * @returns {number} The number of cards selected for the transfer.
 */
function getTransferCardsCount() {
    return parseInt(transferCardsCountElement.textContent);
}


/**
 * Retrieves the current transfer amount directly from the input field.
 * The value is returned as a float (the raw value from the input element).
 * 
 * @returns {string} - The current transfer amount value from the input field.
 */
function getTransferAmountValue() {
    return parseFloat(transferAmountValueElement.value).toFixed(2);
}


function getWalletFromCacheOrLoadFromLocalStorage(){

    let wallet;
    if (!transferRecord.wallet) {

        console.log("Not found, loading the from localStorage");
        wallet                = Wallet.loadWallet(config.SORT_CODE, config.ACCOUNT_NUMBER);
        transferRecord.wallet = wallet // cache

    }  else {

        wallet = transferRecord.wallet;
        console.log("Getting the wallet from the cache")
    }
    return wallet;
}




// toggle functtions

function toggleSelectDestinationIfSame(e) {
    const selectValue = e.target.value;
    const BANK_ID     = "bank";
    const WALLET_ID   = "wallet";

    if (selectValue === BANK_ID){

        transferToBankSelectOptionElement.disabled   = true;
        transferToWalletSelectOptionElement.disabled = false;
             
    } else if (selectValue === WALLET_ID){

        transferToBankSelectOptionElement.disabled   = false;
        transferToWalletSelectOptionElement.disabled = true;
           
    }  
}

/**
 * Toggles between several messages to indicate whether a card has sufficient funds for a transfer.
 * 
 * @param {Number | float} amount - The amount to funds status.
 */
function toggleCardFundsStatus(amount, accountType) {

    if (amount === null) {
        warnError("toggleCardFundsStatus", `The amount cannot be null. Expected a value but got ${amount}`);
        return;
    }

    if (!accountType ) {
        warnError("toggleCardFundStatus", `One or more of the values are empty: amount -${amount}, account type: ${accountType}`);
        return;
    }

    const canTransfer  = transferRecord.wallet.canTransfer(accountType, amount);
  
    if (canTransfer === null){
        return;
    }

    canTransfer ? handleSuccesfulTransfer(amount) : handleUnSuccessfulTransfer();
   
}


function toggleErrorMessage(show=false) {
   toggleErrorMessageHelper(show, errorMessageElement);
}

/**
 * Toggles the card message visibility and applies success or error styling.
 *
 * @param {boolean} show - Whether to display the message.
 * @param {boolean} isSuccess - If true, applies the "green" success style; otherwise, applies the "red" error style.
 */
function toggleTransferMessage(show = false, isSuccess = false) {
    cardMessageElement.classList.toggle("green", isSuccess);
    cardMessageElement.classList.toggle("red", !isSuccess);
    toggleErrorMessageHelper(show, cardMessageElement);
}



function toggleErrorMessageHelper(show, element){
    element = element.classList;
    show ? element.add("show") : element.remove("show");  
} 


function toggleCardAreaDisplay(show=true) {
    show ? cardsAreaElement.classList.add("show") : cardsAreaElement.classList.remove("show");
}



// handle functions

/**
 * Disables the corresponding `transfer to` option based on the selected `transfer from` option.
 * 
 * When the user selects either "Bank" or "Wallet" from the `transfer-from` dropdown, this function:
 * - Disables the matching option in the `transfer-to` dropdown to prevent self-transfers.
 * - Updates the displayed transfer details to reflect the selected source account.
 * 
 * If no wallet is found, a warning is logged.
 * 
 * @param {Event} e - The event object from the `transfer-from` select field.
 */
export function handleDisableMatchingTransferOption(e) {

    const wallet = getWalletFromCacheOrLoadFromLocalStorage();
    toggleSelectDestinationIfSame(e);
    
   
    if (!wallet) {
        warnError("handleDisableMatchingTransferOption", "The wallet wasn't found")
    }
   
    ifTransferFromIsSelectFieldIsClickHandle(e, wallet);
   
}




function handleSuccesfulTransfer(amount) {

    // toggle of any exist error messages
    toggleTransferMessage(false);
    toggleErrorMessage(false);

    const numOfCardsCanFund  = getTransferCardsCount();

    if (numOfCardsCanFund > 0) {

        transferRecord.canFund = true;
        const MINIMUM_AMOUNT   = 0.01;

        if (transferRecord.canFund && amount >= MINIMUM_AMOUNT) {
            
            const labels         = getCardLabelDetails();
            const balance        = formatCurrency(transferRecord.loadedBalance);
            const transferAmount = formatCurrency(getTransferAmountValue())
            const succesMsg      = `You have a balance of ${balance} and can successfully 
                                    fund ${getTransferCardsCount()} card${labels.pluralCards} ${labels.eachLabel} 
                                    with an amount of ${transferAmount}.`;
           
            updateTransferMessageStatus(toTitle(succesMsg));
            toggleTransferMessage(true, true);
        }

    }
}


function handleUnSuccessfulTransfer() {
    if (transferRecord.canFund) {
        transferRecord.canFund = false;
    }
    
    const labels = getCardLabelDetails();

    const formattedCurrency = formatCurrency(transferRecord.loadedBalance)
    const cards             = getTransferCardsCount();
    const errorMsg          = `You have a balance of ${formattedCurrency} but you are trying to fund ${cards} 
                               card${labels.pluralCards} ${labels.eachLabel} with a balance of ${formatCurrency(getTransferAmountValue())}
                              `
    updateTransferMessageStatus(errorMsg)
    toggleTransferMessage(true);
    toggleErrorMessage(true);
}



// valldate methods
function validateAndToggleFundsStatus() {
    const transferAmount = getTransferAmountValue();
    const accountChosen  = getSelectedAccount();
    const MINIMUM_AMOUNT = 0.01

    if (transferAmount > MINIMUM_AMOUNT && accountChosen) {
        toggleCardFundsStatus(transferAmount, accountChosen);
    }
}


function validateTransferInput() {

    const accountChosen      = getSelectedAccount();
    const transferCardsCount = getTransferCardsCount();
    const transferAmount     = getTransferAmountValue();
    const isAmountInvalid    = isNaN(transferAmount);

    if (accountChosen && transferCardsCount >= 0 && isAmountInvalid) {
        updateTransferMessageStatus("You haven't set an amount for the cards yet.");
    } else if (!accountChosen && transferCardsCount >= 0 && isAmountInvalid) {
        updateTransferMessageStatus("You haven't set the transfer from balance or card amount yet.");
    } else if (!accountChosen && transferCardsCount >= 0 && transferAmount) {
        updateTransferMessageStatus("You haven't set the transfer from balance yet.");
    } else {
        toggleTransferMessage(false);
        return;
    }

    toggleTransferMessage(true);
}


function validatePageElements() {

    checkIfHTMLElement(transferFormElement, "The transfer form");
    checkIfHTMLElement(transferButtonElement, "The transfer button form element");
    checkIfHTMLElement(transferFromBankSelectElement, "The transfer from bank option element");
    checkIfHTMLElement(transferToBankSelectOptionElement, "The transfer to bank option element");
    checkIfHTMLElement(transferToWalletSelectOptionElement, "The transfer to wallet option element");
    checkIfHTMLElement(transferFromSelectElement, "The transfer from select element");
    checkIfHTMLElement(transferToSelectElement, "The transfer to select element");
    checkIfHTMLElement(cardsAreaElement, "The card area element in the transfer area div");
    checkIfHTMLElement(accountTypeLabelElement, "The account balance type label");
    checkIfHTMLElement(accountTypeAmountLabelElement, "The transfer card fund amount label");
    checkIfHTMLElement(transferCardsCountElement, "The transfer card count");
    checkIfHTMLElement(transferAmountValueElement, "The transfer amount element");
    checkIfHTMLElement( transferTotalAmountLabelUIElement, "The label for the transfer amount");
    checkIfHTMLElement(amountPerCardAmount, "The amount per card element");
    checkIfHTMLElement(previewModeElement, "The elements for the preview");
    checkIfHTMLElement(errorMessageElement, "The error message for the incorrect funds");
    checkIfHTMLElement(cardMessageElement, "The error message for the cards funds");

}
