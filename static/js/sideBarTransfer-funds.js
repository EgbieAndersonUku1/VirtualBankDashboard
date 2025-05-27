import { checkIfHTMLElement, formatCurrency } from "./utils.js";
import { parseFormData } from "./formUtils.js";
import { openWindowsState, config } from "./config.js";
import { logError, warnError } from "./logger.js";
import { getSelectedSidebarCardState, handleTransferAmountButtonClick } from "./sidebarCard.js";
import { cards } from "./cardsComponent.js";
import { Card } from "./card.js";4
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

let {wallet, bankAccount} = getWalletAndBankAccount();

function getWalletAndBankAccount() {
  const wallet = Wallet.loadWallet(config.SORT_CODE, config.ACCOUNT_NUMBER);
  const bankAccount = BankAccount.getByAccount(config.SORT_CODE, config.ACCOUNT_NUMBER);
  return { wallet, bankAccount };
}



const CardTransfer = {
    transferringTo: null,
}


const TransferConstants =  {
    BANK: "Bank",
    WALLET: "Wallet",
    CARD: "Card"
}


/**
 * Handles a couple of things when called by displaying the correct information in the UI. 
 * Handles:
 * 
 * `setCardTransferBalance`: handles the UI updates e.g makes show that correct
 *                           card information is displayed for a given card e.g balnce, etc
 * 
 * `setBankBalance`: Shows the correct bank account balance
 * `setWalletBalance`: Shows the correct wallet balance
 * 
 */
export function handleTransferCardFieldsDisplay() {
    setCardTransferBalance();
    setBankBalance();
    setWalletBalance();

}


/**
 * Populates the card selection dropdown with the given list of card numbers.
 *
 * When the user selects the "cards" option for transfer, this function
 * displays all valid recipient cards as selectable options.
 *
 * If no valid card numbers are provided, it shows a default message indicating
 * no cards are available.
 *
 * @param {string[]} cardNumbers - Array of card numbers to load into the select dropdown.
 *                                 If empty or invalid, a placeholder option is shown.
 */
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


    // has to be attached dynamically since it doesn't exists unless
    // select dropdown is called, so addEventListener delegation cannot be added
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



/**
 * Handles the transfer type selection in the UI and updates the form accordingly.
 *
 * Triggered when the user selects a transfer destination (e.g., card, bank, wallet)
 * from the "select-transfer-type" dropdown.
 *
 * Based on the selected value:
 *  - Enables/disables the card select dropdown.
 *  - Loads available card numbers, excluding the source card.
 *  - Shows or hides relevant sections of the UI (e.g., card select, bank, or wallet input).
 *
 * @param {Event} e - The DOM event triggered by the selection change.
 */
export function handleSelectAccountTransferElement(e) {
    if (e.target.id !== "select-transfer-type") {
        return;
    }

    const selectValue     = e.target.value?.toLowerCase().trim();
    const CARD_SELECTOR   = "cards";
    const BANK_SELECTOR   = "bank"
    const WALLET_SELECTOR = "wallet";

    // Disable the required fields for selecting a 
    // card when hidden to prevent from not submitting
    selectCardDivElement.classList.remove("show");
    selectCardElement.setAttribute("required", false);
    selectCardElement.disabled = true;

   
    if (selectValue  === CARD_SELECTOR) {

        selectCardDivElement.classList.add("show");
        selectCardElement.setAttribute("required", true);
        selectCardElement.disabled = false;

        CardTransfer.transferringTo = TransferConstants.CARD;

        const numbersToExclude = getSelectedSidebarCardState().lastCardClickeCardNumber;
        const cardNumbers      = getAvailableCardNumbersInWallet([numbersToExclude]);

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

/**
 * Retrieves all card numbers in the user's wallet that are eligible for transfer,
 * excluding any card numbers provided in the exclude list.
 *
 * This is used in the card transfer window when the "cards" option is selected
 * from the dropdown menu which will display valid recipient cards.
 *
 * @param {string[]} exclude - An array of card numbers to exclude from the result.
 *                             Any card number included here will not be shown in the UI.
 * @returns {string[]} An array of card numbers available for transfer (excluding the ones in the exclude list).
 */
function getAvailableCardNumbersInWallet(exclude) {
    if (!Array.isArray(exclude)) {
        logError("getAvailableCardNumbersInWallet", `Expected an array. Got ${typeof exclude}`);
        return [];
    }
    
    const wallet = getWalletFromCacheOrLoadFromLocalStorage();

    if (wallet.numOfCardsInWallet > 0) {
        return Object.keys(wallet.cardNumbers).filter(
            cardNumber => !exclude.includes(cardNumber)
        );
    }
   
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


/**
 * Handles the card selection event by rendering the selected card's details in the UI.
 *
 * When the user selects a card from the dropdown this function retrieves the card 
 * data from the event and updates the transfer UI with the given details.
 *
 * @param {Event} e - The event object containing the target select element and selected value.
 */
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


/**
 * Sets the transfer destination to BANK and updates the UI icon accordingly.
 */
function showBankDiv() {
    CardTransfer.transferringTo = TransferConstants.BANK;
    renderTransferIcon("static/images/icons/university.svg", "bank");
}

/**
 * Sets the transfer destination to WALLET and updates the UI icon accordingly.
 */
function showWalletDiv() {
    CardTransfer.transferringTo = TransferConstants.WALLET;
    renderTransferIcon("static/images/icons/wallet.svg", "wallet");
}


/**
 * Renders an icon image and account name inside the transfer UI element.
 * 
 * This function is called by `showBankDiv` or `showWalletDiv` to display
 * the appropriate image and label for the selected transfer account type.
 * 
 * @param {string} imgSrc - The source URL of the image to render (e.g., bank or wallet icon).
 * @param {string} accountName - The account name to display (e.g., "bank" or "wallet").
 */
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



/**
 * Sets the bank balance display in the UI by fetching the
 * current balance from the wallet data.
 */
function setBankBalance() {
    const wallet = getWalletFromCacheOrLoadFromLocalStorage();
    updateCardFields("setBankBalance", bankBalanceElement, "Bank Balance Element", wallet.bankAmountBalance);
}


/**
 * Sets the wallet balance display in the UI by fetching the
 * current balance from the wallet data.
 */
function setWalletBalance() {
    const wallet = getWalletFromCacheOrLoadFromLocalStorage();
    updateCardFields("setWalletBalance", walletBalanceElement, "Wallet Balance Element", wallet.walletAmount);
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
    if (!amount || amount === null) {
        logError(callingFunctionName, "Expected an amount but got null");
        return;
    }

    // formatCurrency throws an error if the number is not a number
    element.textContent = formatCurrency(amount);
}


/**
 * Handles the closing of the transfer card amount window when the
 * close icon is clicked. It hides the window and updates the state
 * to reflect that the card manager window is closed.
 * 
 * @param {Event} e - The event triggered by clicking the close icon.
 */
export function handleTransferCardWindowCloseIcon(e) {
    const CLOSE_WINDOW_ICON = "transfer-amount-card__window-close-icon";

    if (e.target.id !== CLOSE_WINDOW_ICON) {
        return;
    }

    transferCardAmountContainerElement.classList.remove("show");
    openWindowsState.isCardManagerWindowOpen = false;

}


/**
 * Handles input events on the card transfer amount field.
 * When the input field with the specified ID changes, this function
 * retrieves the entered amount and updates the corresponding UI element,
 * this allows the user to see the amount they are transferring in real-time
 * within the UI.
 * 
 * @param {Event} e - The input event triggered by the amount field.
 */
export function handleCardTransferInputField(e) {
    const INPUT_FIELD_ID  = "card-transfer-amount";

    if (e.target.id !== INPUT_FIELD_ID) {
        return;
    }

    const amount = e.target.value;
   
    if (amount) {
        cardTransferAmountLabelElement.textContent = formatCurrency(amount);

    }
}



/**
 * Handles the click event on the card transfer form button.
 * 
 * When the transfer button is clicked, this function validates the form,
 * parses the required transfer amount, and initiates the transfer process.
 * If the form is invalid, it triggers form validation feedback.
 * If an error occurs during the transfer, it displays an alert message.
 * 
 * @param {Event} e - The click event triggered by the transfer button.
 */
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
            handleAlertMessage(error.message);
            return;
        }
     
      
    } else {
        transferFormElement.reportValidity();
    }

}


/**
 * Transfers funds from the selected card to the correct institution type: bank, wallet, or another card.
 *
 * This function:
 *  - Validates the transfer amount and the selected source card.
 *  - Checks if the source card is eligible (i.e., not blocked).
 *  - Determines the target transfer destination (bank, wallet, or another card).
 *  - Initiates the transfer via the corresponding method.
 *  - Handles post-transfer UI updates and balance refreshes accordingly.
 *
 * @param {number} amountToTransfer - The amount of money to transfer. Must be a valid number.
 *
 * @throws Will throw an error if the selected card is blocked.
 */
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

 
    ({ wallet, bankAccount } = getWalletAndBankAccount()); // Ensure we using the latest data
    

    switch(CardTransfer.transferringTo) {
        case TransferConstants.BANK:
            const isBankTransferSuccessful = bankAccount.transferFromCardToAccount(card, amountToTransfer);
            handleCardTransferSuccess(isBankTransferSuccessful, card);
            walletDashboard.updateBankAccountBalanceText(wallet);
            return;
                
        case TransferConstants.WALLET:
            const isWalletTransferSuccessful = wallet.transferToWallet(cardNumber, amountToTransfer);
            handleCardTransferSuccess(isWalletTransferSuccessful, card);
            walletDashboard.updateWalletAccountBalanceText(wallet);
            return
        
        case TransferConstants.CARD:
            const recipientCardNumber = selectCardElement.value;
            const isCardTransferred   = wallet.transferFundsFromCardToCard(card.cardNumber, recipientCardNumber, amountToTransfer);
            const recipientCard       = Card.getByCardNumber(recipientCardNumber)
         
         
            handleCardTransferSuccess(isCardTransferred, card);
            updateRecipientCardInTransferUIWindow(recipientCardNumber);
            updateCardSideBar([recipientCard])

            return;
        
    }
}




/**
 * Handles the UI updates and success alert after a successful card-to-card transfer.
 *
 * If the transfer was successful (`isSuccess` is true), this function:
 *  - Updates the wallet's total card amount display
 *  - Shows a success alert to the user
 *  - Refreshes the transfer UI with the updated card information
 *
 * @param {boolean} isSuccess - Indicates whether the card transfer was successful.
 * @param {Object} card - The card object that received the transferred amount.
 */
function handleCardTransferSuccess(isSuccess, card) {

    if (isSuccess) {
     
        walletDashboard.updateTotalCardAmountText(wallet);

        AlertUtils.showAlert({
            title: "Card Transfer succesful",
            text: "The amount has successfully be transferred",
            icon: "success",
            confirmButtonText: "Great"
        })
        
        updateTransferUIWithCard(card);
       
    }
}



/**
 * Updates the transfer UI with the latest information from the given card.
 *
 * This function performs several UI update tasks after a card has been modified or money transfered. It:
 *  - Refreshes the card balance
 *  - Updates the card sidebar display
 *  - Manages visibility of transfer-related input fields
 *  - Updates the displayed amount for the source transfer card
 *
 * @param {Object} card - The card object to use for updating the transfer UI.
 */
function updateTransferUIWithCard(card) {
    
    card.refreshBalance();  // get the latest balance after save

    updateCardSideBar([card], true);
    handleTransferCardFieldsDisplay();
    updateSourceTransferCardAmount();
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





/**
 * Displays a warning alert based on a formatted message string.
 *
 * The input message is expected to follow the format: `"Title: Text"`. 
 * The function splits this message by the colon, extracts the title and 
 * text, and passes them to the `AlertUtils.showAlert` method.
 *
 * If no message is provided, it logs a warning and exits early.
 *
 * @param {string} message - A string containing the alert title and text, separated by a colon.
 *
 * @example
 * handleAlertMessage("Warning: This action cannot be undone");
 */
function handleAlertMessage(message) {

    if (!message || message === null || message === undefined) {
        warnError("[handleAlertMessage]. Expected a message but got none");
        return;
    } 

    let title = "Oops something went wrong";
    let text  = "Try refreshing the page";
    let icon = "warning"
    const errorMsgParts =  message.split(":");

    if (errorMsgParts) {
         title  = errorMsgParts[0]?.trim();
         text    = errorMsgParts[1]?.trim();

    } 
   
    AlertUtils.showAlert({
        title: title,
        text: text,
        icon: icon,
        confirmButtonText: "Ok"
    });
}





/**
 * Updates the recipient card information in the `card transfer window`
 * after a transfer has been made from a source card to the recipient card.
 *
 * Normally, the recipient card is updated when the user selects it from
 * the dropdown menu in the transfer window. This triggers the 
 * `handleSelectCardElement` function with an event containing the card's ID and number.
 *
 * However, after a transfer, we want to update the recipient card's info
 * without requiring the user to reselect it or refresh the page.
 *
 * To achieve this, we simulate the selection by creating a "fake" event 
 * that mimics the real one. This synthetic event includes the necessary 
 * `id` and `value`, allowing us to call `handleSelectCardElement` programmatically.
 *
 * @param {string} cardNumber - The card number of the recipient card to update.
 */
function updateRecipientCardInTransferUIWindow(cardNumber) {
    if (!(typeof cardNumber === "string")) {
        return;
    }

    // Create a synthetic event object that mimics the structure of a real DOM event.
    // This is necessary because `handleSelectCardElement` expects to receive an event.
    const fakeEvent = {
        target: {
            id: "select-card",
            value: cardNumber,
        }
    }

    handleSelectCardElement(fakeEvent);
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