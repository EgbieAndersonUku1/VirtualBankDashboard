import { checkIfHTMLElement, formatCurrency } from "./utils.js";
import { parseFormData } from "./formUtils.js";
import { openWindowsState, config } from "./config.js";
import { logError, warnError } from "./logger.js";
import { getSelectedSidebarCardState, handleTransferAmountButtonClick } from "./sidebarCard.js";
import { cards } from "./cardsComponent.js";
import { Card } from "./card.js";
import { prepareCardData } from "./walletUI.js";
import { getWalletFromCacheOrLoadFromLocalStorage } from "./transfer-funds.js";
import { Wallet } from "./wallet.js";
import { walletDashboard } from "./walletUI.js";
import { BankAccount } from "./bankAccount.js";
import { AlertUtils } from "./alerts.js";
import { updateCardSideBar } from "./sidebarCardUpdate.js";



const selectAccountTransferToElement     = document.getElementById("select-transfer-type");
const selectCardDivElement               = document.getElementById("select-card-div");
const transferFormElement                = document.getElementById("transfer-amount-form");
const transferringCardElement            = document.querySelector("#transferring-card .bank-card");
const selectCardElement                  = document.getElementById("select-card");
const transferToElement                  = document.getElementById("transferring-to");
const cardBalanceElement                 = document.getElementById("transfer-card__balance-amount");
const cardTransferAmountElement          = document.getElementById("transfer-card__card-amount");
const bankBalanceElement                 = document.getElementById("transfer-card__bank-balance-amount");
const walletBalanceElement               = document.getElementById("transfer-card__wallet-balance-amount");
const transferCardAmountCloseIcon        = document.getElementById("transfer-amount-card__window-close-icon");
const transferCardAmountContainerElement = document.getElementById("transfer-amount-card");
const cardTransferFieldElement           = document.getElementById("card-transfer-amount");
const cardTransferAmountLabelElement     = document.getElementById("transfer-card__card-amount");
const transferAmountButton               = document.getElementById("transfer-from-card-btn");
const transferAmountFormElement          = document.getElementById("transfer-amount-form");
const cardErrorMessage                   = document.getElementById("transfer-amount-card-error");


validatePageElements()

document.addEventListener("input", handleCardTransferInputField);
document.addEventListener("blur", handleCardTransferInputField);
document.addEventListener("blur", handleCardTransferInputField);


const wallet       = Wallet.loadWallet(config.SORT_CODE, config.ACCOUNT_NUMBER);
const bankAccount  =  BankAccount.getByAccount(config.SORT_CODE, config.ACCOUNT_NUMBER);


const CardTransfer = {
    transferringTo: null,
}


const TransferConstants =  {
    BANK: "Bank",
    WALLET: "Wallet",
    CARD: "Card"
}


export function handleTransferCardFieldsDisplay() {
    setCardTransferBalance();
    setBankBalance();
    setWalletBalance();

}


export function handleSelectAccountTransferElement(e) {
    if (e.target.id !== "select-transfer-type") {
        return;
    }

    const selectValue     = e.target.value?.toLowerCase().trim();
    const CARD_SELECTOR   = "cards";
    const BANK_SELECTOR   = "bank"
    const WALLET_SELECTOR = "wallet";

    selectCardDivElement.classList.remove("show");
    selectCardElement.setAttribute("required", false);
    selectCardElement.disabled = true;

    if (selectValue  === CARD_SELECTOR) {

        selectCardDivElement.classList.add("show");
        selectCardElement.setAttribute("required", true);
        selectCardElement.disabled = false;

        CardTransfer.transferringTo = TransferConstants.CARD;

        const numbersToExclude = getSelectedSidebarCardState().lastCardClickeCardNumber;
        const cardNumbers      = getAvailableCardNumbers([numbersToExclude]);
        loadCardNumbersIntoSelect(cardNumbers);
        return;
    
    }

    if (selectValue === BANK_SELECTOR ) {
       showBankDiv();
       return;
    }

    if (selectValue === WALLET_SELECTOR) {
        showWalletDiv();
        return;
    }
  
}



function getAvailableCardNumbers(exclude = []) {
    if (!Array.isArray(exclude)) {
        logError("getAvailableCardNumbers", `Expected an array. Got ${typeof exclude}`);
        return [];
    }
    
    const wallet = getWalletFromCacheOrLoadFromLocalStorage();

    if (wallet.numOfCardsInWallet > 0) {
        return Object.keys(wallet.cardNumbers).filter(
            cardNumber => !exclude.includes(cardNumber)
        );
    }
   
}


function loadCardNumbersIntoSelect(cardNumbers) {
    
    const SELECT_ID       = "select-card"
    let selectCardElement = selectCardDivElement.querySelector(`#${SELECT_ID}`);

    if (!checkIfHTMLElement(selectCardElement)) {
        logError("loadCardNumbersIntoSelect", "Select element not found. Creating a new one.");
        createSelectElement(SELECT_ID, selectCardDivElement);

      
    } else {
        selectCardElement.innerHTML = ""; // Clear previous options
    }


    if (!Array.isArray(cardNumbers) || cardNumbers.length === 0 || cardNumbers === undefined) {
        selectCardElement.appendChild(createDefaultOption("No cards found to select"));
        return;
    }


    attachSelectEventListenerIfNotAttached(selectCardDivElement);

    const fragment = document.createDocumentFragment();
    fragment.appendChild(createDefaultOption("Select a card"));


    cardNumbers.forEach((cardNumber, index) => {
        const option       = document.createElement("option");
        option.value       = cardNumber;
        option.textContent = `Card ${index + 1} • #${cardNumber}`;
        fragment.appendChild(option);
    });

    selectCardElement.appendChild(fragment);
}


function createSelectElement(id, parentContainerToAppendTo) {
    selectCardElement = document.createElement("select");
    selectCardElement.id = id;
    parentContainerToAppendTo.appendChild(selectCardElement);
}

function createDefaultOption(text) {
    const defaultOption = document.createElement("option");
    defaultOption.disabled = true;
    defaultOption.selected = true
    defaultOption.textContent = text;
    defaultOption.value       = '';
    return defaultOption
}


function attachSelectEventListenerIfNotAttached(selectCardElement) {
    if (!selectCardElement.dataset.listenerAttached) {
        selectCardElement.addEventListener("change", handleSelectCardElement);
        selectCardElement.dataset.listenerAttached = "true";
    }
}


export function handleSelectCardElement(e) {
    const TRANSFER_TO_ID = "select-card";

    if (e.target.id === TRANSFER_TO_ID) {
        const selectValue = e.target.value;
        if (selectValue && selectValue !== undefined) {

            const card        = Card.getByCardNumber(selectValue);
            const cardData    = prepareCardData(card);
            const cardElement = cards.createCardDiv(cardData);
            cards.placeCardDivIn(transferToElement, cardElement, true);
        }
        
    }
}


function showBankDiv() {
    CardTransfer.transferringTo = TransferConstants.BANK;
    renderTransferIcon("static/images/icons/university.svg", "bank");
}


function showWalletDiv() {
    CardTransfer.transferringTo = TransferConstants.WALLET;
    renderTransferIcon("static/images/icons/wallet.svg", "wallet");
}



function renderTransferIcon(imgSrc, accountName) {

    if (!imgSrc || typeof imgSrc !== "string") {
        warnError("renderTransferIcon", "Expected an image string but got none. Setting it empty ");
        imgSrc = "";
    }

    if (!accountName || typeof accountName !== "string") {
        warnError("renderTransferIcon", "Expected an image string but got none. Setting it to empty ");
        accountName = "";
    }


    const divContainer   = document.createElement("div");
    const pElement       = document.createElement("p")
    const img            = document.createElement("img");

    img.src              = imgSrc;
    img.alt              = accountName;
    pElement.textContent = accountName;
    pElement.className   = "capitalize";

    img.classList.add("center", "card-icon");

    divContainer.classList.add("center", "flex-direction-column");

    divContainer.appendChild(img);
    divContainer.appendChild(pElement)

    transferToElement.innerHTML = "";
    transferToElement.appendChild(divContainer);
}



/**
 * Sets the card transfer balance in the UI using the last clicked card.
 * 
 * Retrieves the last clicked card number from sidebar state,
 * finds the corresponding card, and updates the UI with the card's balance.
 * 
 * If no matching card is found, logs an error and exits gracefully.
 * 
 * @function
 * @returns {void}
 * 
 * @example
 * setCardTransferBalance();
 * // → UI shows the balance of the last clicked card
 */
function setCardTransferBalance() {

    const cardNumber = getSelectedSidebarCardState().lastCardClickeCardNumber;

    if (!cardNumber) {
        logError("setCardTransferBalance", `The card number was not found, there should be a card number since the card was clicked`);
        return;
    }
    const card = Card.getByCardNumber(cardNumber);

    if (!card) {
        logError("setCardTransferBalance", "The card object");
        return;
    }
    updateCardFields("updateCardTransferAmount", cardBalanceElement, "Card balance element", card.balance)
}



function setBankBalance() {
    const wallet = getWalletFromCacheOrLoadFromLocalStorage();
    updateCardFields("setBankBalance", bankBalanceElement, "Bank Balance Element", wallet.bankAmountBalance);
}


function setWalletBalance() {
    const wallet = getWalletFromCacheOrLoadFromLocalStorage();
    updateCardFields("setWalletBalance", walletBalanceElement, "Wallet Balance Element", wallet.walletAmount)
}



/**
 * Updates the text content of a given HTML element with a formatted currency amount.
 * 
 * This helper function ensures:
 * - `callingFunctionName` is a string (for logging/debugging purposes)
 * - `element` is a valid HTMLElement (validated using `checkIfHTMLElement`)
 * - `amount` is present and valid
 * 
 * Throws an error if the function name is invalid.
 * Logs an error and returns early if the element is not valid or if the amount is missing.
 * Uses `formatCurrency` to apply commas and currency formatting before updating the element.
 * 
 * @param {string} callingFunctionName - Name of the calling function, useful for error context
 * @param {HTMLElement} element - The DOM element to update
 * @param {string} elementName - A readable name for the element (used in validation error messages)
 * @param {number|string} amount - The amount to display in the element
 * 
 * @returns {void}
 * 
 * @throws {Error} If `callingFunctionName` is not a string
 * 
 * @example
 * updateCardFields("setWalletBalance", walletBalanceEl, "Wallet Balance", 1200);
 * // → walletBalanceEl.textContent = "£1,200.00"
 */
function updateCardFields(callingFunctionName, element, elementName, amount) {

    if (typeof callingFunctionName !== "string") {
        throw new Error(`The calling function must be name. Expected a name but got ${callingFunctionName} with type ${typeof callingFunctionName}`);
    }

    if (!checkIfHTMLElement(element, elementName)) {
        return;
    }
    if (!amount) {
        logError(callingFunctionName, "Expected an amount but got null");
        return;
    }

    // formatCurrency throws an error if the number is not a number
    element.textContent = formatCurrency(amount);
}


export function handleTransferCardWindowCloseIcon(e) {
    const CLOSE_WINDOW_ICON = "transfer-amount-card__window-close-icon";

    if (e.target.id !== CLOSE_WINDOW_ICON) {
        return;
    }

    transferCardAmountContainerElement.classList.remove("show");
    openWindowsState.isCardManagerWindowOpen = false;


}


export function handleCardTransferInputField(e) {
    const INPUT_FIELD_ID  = "card-transfer-amount";

    if (e.target.id !== INPUT_FIELD_ID) {
        return;
    }

    const amount = e.target.value;
    updateInputFieldElement(amount);

}


function updateInputFieldElement(amount) {
    cardTransferAmountLabelElement.textContent = formatCurrency(amount);   
}


export function handleCardTransferAmountFormButtonClick(e) {
    const TRANSFER_BTN_ID = "transfer-from-card-btn";

    if (e.target.id !== TRANSFER_BTN_ID ) {
        return;
    }


    if (transferFormElement.checkValidity()) {
      
        
        const formData = new FormData(transferFormElement);
        if (!formData) {
            logError("handleCardTransferAmountFormButtonClick", "Expected a card transfer form since the form was succeesfully submit");
            return;
        }
      
        const requiredFields = ["transfer-card-amount"];
        const parsedFormData = parseFormData(formData, requiredFields);
    
        const amount = parseFloat(parsedFormData.transferCardAmount);

        try {
            transferToRightInstitution(amount);  

        } catch (error) {
          
            const msg = error.message.split(".")[0].trim()

            if (error.message.split(".")[0].trim() === msg) {
                handleInsufficientFundsCardAlert();
                return;
            }

            handleBlockCardAlert();
            return;
        }
     
      
    } else {
        transferFormElement.reportValidity();
    }

}


function transferToRightInstitution(amountToTransfer) {

    const cardNumber = getSelectedSidebarCardState().lastCardClickeCardNumber;
    const card       = Card.getByCardNumber(cardNumber);

    if (!amountToTransfer) {
        console.error(`The amount to transfer cannot be null. Expected an int or float but got ${amountToTransfer}`);
        return;
    }
   
    if (!isNaN) {
        console.error(`The amount to transfer must be a num or float. Expected an int or float but got ${typeof amountToTransfer}`);
        return;
    }
    
    if (!card) {
        console.error("Something went wrong, expected a card, since a card was clicked. Got none");
        return;
    }

    if (card.isBlocked) {
        throw new Error(`The card ${card.cardNumber} cannot transfer funds because it is blocked`);
    }

    switch(CardTransfer.transferringTo) {
        case TransferConstants.BANK:
            const isBankTransferSuccessful = bankAccount.transferFromCardToAccount(card, amountToTransfer);
            updateCardUISideBar(isBankTransferSuccessful, card);
            return;
                
        case TransferConstants.WALLET:
            const isWalletTransferSuccessful = wallet.transferToWallet(cardNumber, amountToTransfer);
            updateCardUISideBar(isWalletTransferSuccessful, card);
            return
        
        case TransferConstants.CARD:
            // to add
            return;
    }
}


function updateCardUISideBar(isSuccess, card) {
    if (isSuccess) {
     
        walletDashboard.updateTotalCardAmountText(wallet);

        AlertUtils.showAlert({
            title: "Card Transfer succesful",
            text: "The amount has successfully be transferred",
            icon: "success",
            confirmButtonText: "Great"
        })
        
     
        updateCardSideBar([card], true);
        handleTransferCardFieldsDisplay();
        updateSourceTransferCardAmount();
  
    }
}


/**
 * Updates the UI for the transfer amount of the *source* card—the card
 * initiating the transfer. This is done by simulating a button click
 * using a synthetic event, which is required by the `handleTransferAmountButtonClick`
 * function that normally relies on a real DOM event.
 */
function updateSourceTransferCardAmount() {

    // `handleTransferAmountButtonClick` normally handles clicks on the transfer button
    // and expects an event object containing the clicked button's `id`.
    // Since we're calling it programmatically (not from a real event),
    // we simulate the event with the required structure.
    const fakeEvent = {
        target: {
            id: "transfer-card-amount"
        }
    };

    handleTransferAmountButtonClick(fakeEvent);
}



function toggleErrorMessage(show=true) {
    cardErrorMessage.innerHTML     = "";
    cardErrorMessage.style.display =  show ? "block" : "none"
    
}



function handleBlockCardAlert() {
    AlertUtils.showAlert({
        title: "Blocked card",
        text: "You can't transfer money from this card because it is blocked.",
        icon: "warning",
        confirmButtonText: "Ok"
    });
}


function handleInsufficientFundsCardAlert() {
    AlertUtils.showAlert({
        title: "Insufficient funds",
        text: "You can't transfer money from this card because it is insufficient funds.",
        icon: "warning",
        confirmButtonText: "Ok"
    });
}





function validatePageElements() {
    checkIfHTMLElement(selectAccountTransferToElement, "The select card element for selecting elements");
    checkIfHTMLElement(selectCardDivElement, "The select element for picking a card");
    checkIfHTMLElement(transferFormElement, "The transform element");
    checkIfHTMLElement(transferringCardElement, "The card that will be transferring the money");
    checkIfHTMLElement(transferToElement, "The transfer to element");
    checkIfHTMLElement(transferCardAmountCloseIcon, "The transfer window close icon");
    checkIfHTMLElement(transferCardAmountContainerElement, "The transfer container window");
    checkIfHTMLElement(cardTransferFieldElement, "[cardTransferAmountElement]");
    checkIfHTMLElement(cardTransferAmountLabelElement, "[cardTransferAmountLabelElement]");
    checkIfHTMLElement(transferAmountButton, "[transferAmountButton]");
    checkIfHTMLElement(transferAmountFormElement, "[transferAmountFormElement]");
    checkIfHTMLElement(cardErrorMessage, "[cardErrorMessage]")

}