import { checkIfHTMLElement } from "./utils.js";
import { Wallet } from "./wallet.js";
import { config, openWindowsState } from "./config.js";
import { cards} from "./cardsComponent.js";
import { warnError, logError } from "./logger.js";
import { handleInputFieldValueLength, toTitle } from "./utils.js";
import { formatCurrency } from "./utils.js";
import { transferProgressBar } from "./progress.js";
import { AlertUtils } from "./alerts.js";
import { walletDashboard } from "./walletUI.js";
import { notificationManager } from "./notificationManager.js";
import { getSelectedSidebarCardState } from "./sidebarCard.js";
import { updateCardSideBar } from "./sidebarCardUpdate.js";


const transferFormElement                 = document.getElementById("wallet-transfer-form");
const transferButtonElement               = document.getElementById("wallet-transfer-btn");
const transferFromBankSelectElement       = document.getElementById("transfer-from-bank");
const transferToBankSelectOptionElement   = document.getElementById("transfer-to-bank");
const transferToWalletSelectOptionElement = document.getElementById("transfer-to-wallet");
const transferFromSelectElement           = document.getElementById("transfer-from");
const transferToSelectElement             = document.getElementById("transfer-to");
const cardsAreaElement                    = document.getElementById("wallet-cards");
const accountTypeLabelElement             = document.getElementById("account-balance-type");
const accountTypeAmountLabelElement       = document.getElementById("transfer-card-fund-amount");
const transferCardsCountElement           = document.getElementById("transfer-cards-count");
const transferAmountValueElement          = document.getElementById("transfer-amount-value");
const transferTotalAmountLabelUIElement   = document.getElementById("transfer-total-amount");
const amountPerCardAmount                 = document.getElementById("amount-per-card");
const previewModeElement                  = document.getElementById("preview-mode");
const errorMessageElement                 = document.getElementById("transfer-messages-id");
const cardMessageElement                  = document.getElementById("transfer-error-card-msg-id");
const transferProgressContainer           = document.getElementById("transfer-progress-container");
const transferCloseIconElement            = document.getElementById("transfer-close-icon");
const transferDivElement                  = document.getElementById("transfer");
const transferErrorMessageContainer       = document.getElementById("transfer-error-msg");


notificationManager.setKey(config.NOTIFICATION_KEY);

validatePageElements();
resetSelectFields();

const RESET_VALUE = 0


transferAmountValueElement.addEventListener("input", handleTransferAmountInputField);
transferAmountValueElement.addEventListener("blur", handleTransferAmountInputField);
transferFromSelectElement.addEventListener("change", handleDisableMatchingTransferOption);
transferToSelectElement.addEventListener("change", handleTransferToSelectOption);

const transferRecord = {}



const RECORD_KEY = "selectedCards";

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
        transferRecord.transferTo = select.value;
        togglePreviewMode();
        toggleTransferMessage(false);
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

    transferRecord.wallet         = getWalletFromCacheOrLoadFromLocalStorage(); // get the cards from that localStorage to ensure lates cards
    transferRecord.isCardMode     = true;

    // shows the avaialble card that can be transferred to 
    const cardsToTransferElement  = cards.createCardsToShow(transferRecord.wallet);
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
    
    if (selectValue === "bank" || selectValue === "wallet") {

        transferRecord.isCardMode = false;
        config.isCardMode         = false;
        
        toggleCardAreaDisplay(false)
        updatePerCountCardValue(RESET_VALUE);
        updateTransferCardCount(RESET_VALUE)

        resetSelectedCardsInRecord(true);
        validateAndDisplayAccountTransferStatus(getTransferAmountValue());
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
export async function handleTransferButtonClick(e) {

    const BUTTON_ID = "wallet-transfer-btn";

    if (e.target.id !== BUTTON_ID) {
        return;
    }

    if (transferFormElement.checkValidity()) {

        toggleErrorMessage(false);
        toggleTransferMessage(false);

        if (!transferRecord.canTransfer) {
           return handleInsufficientAlertMessage();
        }

        if (transferRecord.isCardMode ) {
            return handleCardModeAlert();
        }

        const resp = await showConfirmationTransferAlert();

        if (resp) {
            handleAccountToAccountSuccessTransfer();
            return;
        }

    } else {
        transferFormElement.reportValidity();
    }

}




async function showConfirmationTransferAlert({  title = "Confirm Transfer",
                                                icon = "info",
                                                cancelMessage = "Transfer has been cancelled",
                                                messageToDisplayOnSuccess = "Transfer complete.",
                                                confirmButtonText = "Proceed with Transfer",
                                                denyButtonText = "Cancel Transfer"} = {}) {

    return await AlertUtils.showConfirmationAlert({
        title: title,
        icon: icon,
        cancelMessage: cancelMessage,
        messageToDisplayOnSuccess: messageToDisplayOnSuccess,
        confirmButtonText: confirmButtonText,
        denyButtonText: denyButtonText,
    });

}


function handleCardModeAlert() {
    if (transferRecord.isCardMode && getSelectedCards().length === 0) {
        return handleEmptyCardsAlert();
    }

    return handleCardModeSuccessTransfer();
}



/**
 * This function is responsible for handling the succesful
 * transfer of funds to cards. It displays an alert,
 * sends the neccessary notification, and performs any
 * clean up neccessary
 
 * @returns 
 */
async function handleCardModeSuccessTransfer() {

    const resp = await showConfirmationTransferAlert();

    if (resp) {

        const selectedCards = getSelectedCards();
        const amountPerCard = getTransferAmountValue()
        const totalCards    = getTransferCardsCount();
        const totalAmount   = amountPerCard * totalCards;
        const sourceAccount = getSourceAccount();
        const {isSaved, cardsSaved } = transferRecord.wallet.transferAmountToMultipleCards(selectedCards, totalAmount, amountPerCard, sourceAccount);

        if (isSaved) {
            notificationManager.add(`You have successfully transferred ${formatCurrency(totalAmount)} 
                                    from your ${sourceAccount} to ${selectedCards.length} card${selectedCards.length > 1 ? 's' : ''}, 
                                    with ${selectedCards.length > 1 ? 'each' : 'the'} card receiving ${formatCurrency(amountPerCard)}.`);

            transferProgressContainer.classList.add("show");

            const transferMessage = "Transferring funds ";
            const progressBarBy   = 1;

            transferProgressBar(getSourceAccount(),
                transferRecord.transferTo,
                transferMessage,
                progressBarBy,
            );

            resetCardMode();
            config.isFundsUpdated = true;
            updateCardSideBar(cardsSaved);
            return updateUIAfterSuccessfulTransfer();
        }

    }

}


function handleAccountToAccountSuccessTransfer() {

    const sourceAccount    = getSourceAccount();
    const recipientAccount = transferRecord.transferTo;

    if (!sourceAccount) {
        logError("handleAccountToAccountSuccessTransfer", "Something went wrong and source account input field is empty");
        return;
    }

    if (!recipientAccount) {
        logError("handleAccountToAccountSuccessTransfer", "Something went wrong and recipient account input field is empty");
        return;
    }

    if (sourceAccount === recipientAccount) {
        handleSameAccountTransferError();
        return;
    }

    const wallet           = transferRecord.wallet;
    const amountToTransfer = getTransferAmountValue();
    let isSaved            = performTransfer(wallet, recipientAccount, amountToTransfer);

    if (isSaved) {
        notificationManager.add(`You have successfully transferred ${formatCurrency(amountToTransfer)} 
                                from your ${sourceAccount} to your ${recipientAccount}.`);


        config.isFundsUpdated = true;
        handleSuccessfulSave()
    } else {
        handleUnsuccessfulSave()
    }

    return isSaved;
  
}


// handle Alerts
function handleEmptyCardsAlert() {
    
    handleShowAlertMessage({title:"No cards selected",
                            text:"You haven't selected any cards",
                            icon:"warning",
                            confirmationButtonText:"ok",
                            additionalMsg:"No transfer occured because you didn't select any cards"
    })
    return false;
}


function handleSameAccountTransferError() {
    handleShowAlertMessage({title:"Invalid Selection", 
                            text: "The source and recipient accounts cannot be the same",
                            icon: "error",
                            confirmationButtonText: "Ok!"
    })

    return false;
}



function handleInsufficientAlertMessage(){

    const additionalMsg = "You have insufficients funds to make the transfer, please adjust and try again";
   
    handleShowAlertMessage({title: "Insufficient Funds",
                           text: "You have insufficients funds to make the transfer",
                           icon: "error",
                           confirmationButtonText: "Ok!",
                           additionalMsg: additionalMsg,
                                })
    return false
    
    }


function handleUnsuccessfulSave() {

    const additionalMsg = `Amount in balance ${formatCurrency(transferRecord.loadedBalance)}
                           and the amount being transferred ${formatCurrency(getTransferAmountValue())}    
                         `;

   
    handleShowAlertMessage({title: "Transaction Failed",
                            text: "The transaction could not be completed. Please check your funds and try again.",
                            icon: "error",
                            confirmButtonText: "Try Again",
                            additionalMsg: additionalMsg
                            });
    return false
}


/**
 * Displays an alert using the provided parameters, and optionally shows a longer message in the form area.
 *
 * @param {Object} param - The alert configuration.
 * @param {string} param.title - The alert's title.
 * @param {string} param.text - The alert message body.
 * @param {string} param.icon - The type of icon: "error", "success", "warning", or "info".
 * @param {string} param.confirmationButtonText - The confirmation button label.
 * @param {string} [param.additionalMsg=""] - An optional additional message shown in the form area.
 *
 * @throws {Error} If required fields are missing or `icon` is invalid.
 *
 * @returns {void} The function that calls it is responsible for returning a value
 */
function handleShowAlertMessage({ title, text, icon, confirmationButtonText, additionalMsg = "" }) {

   
    if (!title || !text || !icon || !confirmationButtonText) {
        throw new Error(`Missing required alert fields:
        - Title: ${title}
        - Text: ${text}
        - Icon: ${icon}
        - Confirmation Button Text: ${confirmationButtonText}`);
    }

    // Validate icon value
    const validIcons = ["success", "error", "warning", "info"];
    if (!validIcons.includes(icon.toLowerCase())) {
        throw new Error(`Invalid icon type "${icon}". Must be one of: ${validIcons.join(", ")}`);
    }

    // Show additional message in the form area (if any)
    if (additionalMsg) {
        updateTransferMessageStatus(additionalMsg);
        toggleTransferMessage(true);
    }

   
    AlertUtils.showAlert({
        title,
        text,
        icon,
        confirmButtonText: confirmationButtonText
    });
}


/**
 * Handles the successfully saving of the funds. Ensures that the
 * wallet instance now contains the updated funds.
 * 
 * @param {string} = An option msg that the can be displayed on the 
 *                  form after a successfully save.
 * @returns 
 */
function handleSuccessfulSave(msg = "Transferring funds ") {

    transferProgressContainer.classList.add("show");

    const transferMessage = msg;
    const progressBarBy   = 1;

    transferProgressBar(
        getSourceAccount(),
        transferRecord.transferTo,
        transferMessage,
        progressBarBy
    );

    updateUIAfterSuccessfulTransfer();
    return true;
}



/**
 * Updates the UI with the details of the wallet after a successful transfer. The function updates
 * all aspect of the UI in regards to the money, messages and toggles off preview mode.
 * 
 * @param {*} msg - A message that can be shown in the form area when a successful transfer has occurred. 
 *                  Default message is `Transaction was successfully`
 * 
 * @returns {boolean}
 */
function updateUIAfterSuccessfulTransfer(msg = "Transaction was successfully") {

    const wallet  = getWalletFromCacheOrLoadFromLocalStorage();;
    const account = getSourceAccount();

    updateTransferAmountLabelValueUI(0);

    togglePreviewMode(false);
    updateTransferMessageStatus(msg);
    toggleTransferMessage(true, true);

    if (account === "bank") {
        displayTransferBankDetails(wallet);

    } else {
        displayTransferWalletDetails(wallet);
    }

    walletDashboard.updateBankAccountBalanceText(wallet);
    walletDashboard.updateWalletAccountBalanceText(wallet);


    return true;
}

/**
 * CARD MODE state
 */

/**
 * Resets all flags and state variables related to `card mode`.
 *
 * The application enters `card mode` when the user selects the "cards" option from 
 * the recipient dropdown. This mode enables tracking of selected cards, 
 * whether additional cards can be funded, and other transfer-related conditions.
 * 
 * When the user initiates a transfer, the application checks whether it's in 
 * `card mode` and adjusts the logic accordingly.
 * 
 * This function resets all the flags and data structures associated with 
 * `card mode` to their default values.
 *
 */
function resetCardMode() {

    transferRecord.isCardMode    = false;
    transferRecord.canTransfer   = false;
    transferRecord.canFundCards  = false;

    updatePerCountCardValue(RESET_VALUE);
    updateTransferCardCount(RESET_VALUE);
    resetTransferToSelect();
    resetSelectedCardsInRecord(true);

    console.log("All card states has been reset")
}


/**
 * Returns a list of card numbers the user has selected during `card mode`.
 *
 * In `card mode`, the app tracks various states such as how many cards 
 * are selected, whether each card can be funded, and other flags.
 * 
 * This function specifically retrieves all card numbers that have 
 * been marked as selected by the user.
 *
 * @returns {Array} An array of selected card numbers. Returns an empty array 
 *                  if no cards are selected or if `transferRecord[RECORD_KEY]` is null/undefined.
 */
function getSelectedCards() {
    const selectedCards = [];

    const userCards = transferRecord[RECORD_KEY];
    if (!userCards || userCards === null) {
        return selectedCards;
    }

    for (const [cardNumber, value] of Object.entries(userCards)) {
        if (value.isSelected) {
            selectedCards.push(cardNumber)
        }
    }
    return selectedCards
}



/**
 * Updates the transfer record in `card mode` by tracking the selection 
 * or deselection of cards in the UI.
 * 
 * When a card is selected, the function adds the card number to the transfer 
 * record and marks it as selected. When a card is unselected, it updates the 
 * corresponding record and sets `isSelected` to false.
 * 
 * If the `RECORD_KEY` does not exist in `transferRecord`, the function 
 * creates it. If the card number is already present, it simply updates 
 * the selection status.
 * 
 * Note: `RECORD_KEY` is a constant defined at the top of the file and used 
 * to store all selected cards in `transferRecord`.
 * 
 * @param {string|number} cardNumber - The card number being selected or unselected.
 * @param {boolean} isSelected - Flag indicating whether the card is selected (`true`) or unselected (`false`).
 * 
 * @returns {void}
 * 
 * @example
 * // User selects card 1234
 * updateRecord(1234, true);
 * 
 * // User later unselects card 1234
 * updateRecord(1234, false);
 * 
 * // transferRecord might look like:
 * // {
 * //   cardRecords: {
 * //     1234: { isSelected: false }
 * //   }
 * // }
 */
function updateRecord(cardNumber, isSelected) {

    if (!cardNumber) {
        warnError("updateRecord", "Expected a card number but got nothing")
    }


    if (!transferRecord.hasOwnProperty(RECORD_KEY)) {
        warnError("updateRecord", "Selected key was not found in the record, recreating key")
        transferRecord[RECORD_KEY] = {}

    }

    if (transferRecord[RECORD_KEY].hasOwnProperty(cardNumber)) {
        transferRecord[RECORD_KEY][cardNumber].isSelected = isSelected;
        return;
    }

    transferRecord[RECORD_KEY][cardNumber] = { isSelected: isSelected }

}

/**
 * A function used in `card mode`. When the user successfully completes their transaction,
 * this function clears all the `selected` cards, ensuring that each new transaction 
 * starts with a fresh state.
 * 
 * It resets the object stored under the `RECORD_KEY` in `transferRecord`, removing
 * all previously selected cards from memory, or just clearing their `isSelected` flags 
 * if you want to keep the card numbers intact for future use.
 * 
 * @param {boolean} deepCleanup - If true, only clears the `isSelected` flag of each card,
 *                                leaving the card numbers intact. Default is false (full reset).
 * 
 * @example
 * // Before transaction
 * transferRecord[RECORD_KEY] = {
 *   "1234": { isSelected: true },
 *   "5678": { isSelected: true },
 * };
 * 
 * resetSelectedCardsInRecord();
 * 
 * // After transaction (full reset)
 * console.log(transferRecord[RECORD_KEY]); // {}
 * 
 * // With deep cleanup (only `isSelected` cleared)
 * resetSelectedCardsInRecord(true);
 * console.log(transferRecord[RECORD_KEY]); // { "1234": { isSelected: false }, "5678": { isSelected: false } }
 */
function resetSelectedCardsInRecord(deepCleanup = false) {
    if (transferRecord.hasOwnProperty(RECORD_KEY)) {
        if (deepCleanup) {

            // Clear only the 'isSelected' flag
            Object.keys(transferRecord[RECORD_KEY]).forEach(cardNumber => {
                transferRecord[RECORD_KEY][cardNumber].isSelected = false;
            });
        } else {

            // Full reset, clearing the entire object
            transferRecord[RECORD_KEY] = {};
        }
    } else {

        warnError("resetSelectedCardsInRecord", "RECORD_KEY not found in transferRecord.")

    }
}


/**
 * Evaluates if the user is eligible to fund selected cards in `card mode`, 
 * based on the number of fundable cards and the entered amount.
 * 
 * This function performs the following:
 * - Resets any existing transfer or error messages.
 * - Checks if any selected cards can be funded (`getTransferCardsCount()`).
 * - If cards can be funded and the amount meets the minimum threshold (0.01),
 *   it generates a dynamic success message indicating how many cards 
 *   can be funded and the total amount.
 * 
 * The function also updates internal flags like `transferRecord.canFundCards` 
 * and `transferRecord.canTransfer`, and displays a user-friendly message if conditions are met.
 * 
 * @param {number} amount - The transfer amount entered by the user.
 * 
 * @returns {void} This function does not return a value but performs UI and state updates.
 * 
 * @example
 * // User enters £25 and has selected 2 cards
 * cardEligibilityMessage(25);
 * */
function cardEligibilityMessage(amount) {

    // toggle of any exist error messages
    toggleTransferMessage(false);
    toggleErrorMessage(false);

    const numOfCardsCanFund = getTransferCardsCount();

    if (numOfCardsCanFund > 0) {

        transferRecord.canFundCards = true;
        const MINIMUM_AMOUNT = 0.01;

        if (transferRecord.canFundCards && amount >= MINIMUM_AMOUNT) {

            const labels         = getCardLabelDetails();
            const balance        = formatCurrency(transferRecord.loadedBalance);
            const transferAmount = formatCurrency(getTransferAmountValue())
            const succesMsg      = `You have a balance of ${balance} and can successfully 
                                    fund ${getTransferCardsCount()} card${labels.pluralCards} ${labels.eachLabel} 
                                    with an amount of ${transferAmount}.`;

            updateTransferMessageStatus(toTitle(succesMsg));
            toggleTransferMessage(true, true);
            transferRecord.canTransfer = true;
        }


    }
}


/**
 * Displays an error message when the user attempts to fund cards 
 * but the transfer conditions are not met (e.g. insufficient funds).
 * 
 * This function is typically called in `card mode` after validating 
 * that funding the selected cards is not possible. It:
 * - Resets the `canFundCards` flag.
 * - Constructs a detailed error message showing the user's balance,
 *   the number of selected cards, and the attempted transfer amount.
 * - Updates the UI to reflect the failed transfer attempt by showing
 *   an error message and disabling transfer-related flags.
 * 
 * @returns {void} This function performs UI and state updates but does not return a value.
 * 
 * @example
 * // User tries to fund 3 cards with more than available balance
 * cardIneligibilityMessage();
 * // -> "You have a balance of £10 but you are trying to fund 3 cards each with a balance of £25."
 */
function cardIneligibilityMessage() {

    if (transferRecord.canFundCards) {
        transferRecord.canFundCards = false;
    }

    const labels = getCardLabelDetails();

    const formattedCurrency = formatCurrency(transferRecord.loadedBalance)
    const cards             = getTransferCardsCount();
    const errorMsg          = `You have a balance of ${formattedCurrency} but you are trying to fund ${cards} 
                               card${labels.pluralCards} ${labels.eachLabel} with a balance of
                                ${formatCurrency(getTransferAmountValue())}
                              `
    updateTransferMessageStatus(errorMsg)
    toggleTransferMessage(true);
    toggleErrorMessage(true);
    transferRecord.canTransfer = false;
}


/**
 * Handles the selection or unselecting of a user's card in the UI when clicked in the front end.
 * It ensures the selected or unselected card belongs to the correct parent container
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
   
    

    // console.log(card);
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

    const value = handleInputFieldValueLength({ e: e, convertToFloat: true, returnInputValue: true });
    const cardCount = getTransferCardsCount();

    updateTransferAmountLabelValueUI(value);

    validateTransferInput();

    if (cardCount > 0) {
        const amount = getTransferCardsCount() * getTransferAmountValue();
        toggleCardFundsStatus(amount, getSourceAccount());
        updatePerCountCardValue(value);
        return;
    }

    validateAndDisplayAccountTransferStatus(value);

}


/**
 * Handles selection changes in the `transfer from` dropdown.
 * 
 * When the user selects an option (e.g., `bank` or `wallet`), this function:
 * - Retrieves the corresponding balance.
 * - Stores it in the `transferRecord` cache to prevent unnecessary fetches from localStorage 
 *   (since the balance is actually unchanged until user hits transfer buttom) everytime the user 
 *   switches bewtween `bank` or `wallet` .
 * - Informs the user that there are in preview mode and nothing is permaneantly.
 * - Updates the UI to reflect the selected option.
 * 
 * @param {*} e - The event containing the selected option.
 * @param {*} wallet - The wallet object associated with the user.
 */
function ifTransferFromIsSelectFieldIsClickHandle(e, wallet) {
    const selectValue   = e.target.value;
    let isInPreviewMode = false;
    const BANK_ID       = "bank";
    const WALLET_ID     = "wallet";

    if (e.target.matches("#transfer-from")) {

        switch (selectValue) {
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
    displayTransferDetails("Bank Account", wallet?.bankAmountBalance);
    transferRecord.loadedBalance = wallet?.bankAmountBalance;
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
    accountTypeLabelElement.textContent = `${toTitle(name)}`;
    accountTypeAmountLabelElement.textContent = `£${amount}`

}



/**
 * Toggles the preview mode UI state. When in preview mode, 
 * the user is informed that any changes made will not be persisted until
 * they hit transfer button.
 * 
 * @param {boolean} [show=true] - If true, enables preview mode by showing the relevant UI element;
 *                                if false, disables it by hiding the element.
 * 
 * @returns {void}
 */
function togglePreviewMode(show = true) {
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

    const blockedCard      = getSelectedSidebarCardState()[card.dataset.cardNumber];

    // console.log(blockedCard)
    if (blockedCard && blockedCard.cardStatus === "blocked") {
        showBlockedCardFundingError(blockedCard, isSelected);
        return;
    }
    
    let newCount;

    if (isSelected) {
        newCount = currentCardCount + 1;
        updateRecord(card.dataset.cardNumber, isSelected);
       
    } else {
        newCount = currentCardCount - 1;
        updateRecord(card.dataset.cardNumber, isSelected);

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

    const accountType = getSourceAccount();

    if (!isNaN(newTransferAmount)) {
        toggleCardFundsStatus(newTransferAmount, accountType, card);
    }

}

/**
 * Checks if a selected sidebar card is blocked and, if so, displays an appropriate message.
 *
 * @param {Object} card - The card that will be checked to see if it is blocked.
 * @param {Object} isSelected - Tells the function whether to display or hide the message. If the user
 *                              selects a blocked card, a blocked message is shown. However, if the user
 *                              unselects the blocked card, then the message is hidden.
 * @returns {boolean} - Returns `true` if the card is blocked and a message was shown, otherwise `false`.
 */
function showBlockedCardFundingError(card, isSelected) {
   
    if (card.cardStatus === "blocked") {

        if (!isSelected) {
            toggleMessage(card.id)
            return;
        }
        const isShown = toggleMessage(card.id, true);

        if (!isShown) {
            const msg = `Card number #${card.cardNumber} is blocked and can’t receive funds right now.`;
            addMessage(msg, card.id, true);
            return true;
        }

        return true; 
    }

    return false;
}



/**
 * Updates the total transfer amount displayed on the UI.
 * The amount is formatted as a string with two decimal places for proper display.
 *
 * @param {string} amount - The amount to be transferred (in string format). Must be a valid numeric string.
 * @throws {Error} If the amount is not a valid string or is empty, an error message is logged and the displayed amount is set to £0.00.
 */
function updateTransferAmountLabelValueUI(amount) {

    const NO_CURRENCY = "0.00";

    if (!amount) {
        transferTotalAmountLabelUIElement.textContent = formatCurrency(NO_CURRENCY);
        return;
    }

    if (!(typeof amount === "number" || typeof amount === "string")) {
        warnError("updateTransferAmountLabelValueUI", `The amount passed must be an integer/float or string but got unexpected type: ${typeof amount}`);
        transferTotalAmountLabelUIElement.textContent = formatCurrency(NO_CURRENCY);
        return;
    }

    const numberOfCardsSelected = getTransferCardsCount()

    amount = parseFloat(amount).toFixed(2);

    if (numberOfCardsSelected > 0) {
        const total = numberOfCardsSelected * getTransferAmountValue();
        transferTotalAmountLabelUIElement.textContent = formatCurrency(total);
        return;
    }

    transferTotalAmountLabelUIElement.textContent = formatCurrency(amount);


}


/**
 * Updates the number of cards the user wants to transfer funds to.
 * * 
 * @returns {number} The number of cards selected for the transfer.
 */
function updateTransferCardCount(numOfCards) {
    return transferCardsCountElement.textContent = numOfCards;

}

/**
 * Allows the message in the transfer form to be updated
 * @param {*} msg 
 */
function updateTransferMessageStatus(msg) {
    if (!msg || typeof msg !== "string") {
        warnError("updateTransferMessageStatus", `The message must be a string and cannot be empty. Expected a string but got ${typeof msg}`)
    }
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



/**
 * Displays a contextual transfer message for account-to-account transfers,
 * informing the user whether they have sufficient funds to complete the transfer.
 *
 * The message will show success or error feedback based on the user's available balance
 * and the amount they intend to transfer. This function updates UI flags accordingly,
 * including `canTransfer` status and toggles appropriate message displays.
 *
 * @param {number} transferAmount - The amount the user wants to transfer.
 *
 * @returns {void} This function returns nothing. It updates the UI and internal state
 *                 to reflect whether the transfer can proceed.
 *
 * @example
 * validateAndDisplayAccountTransferStatus(50.00);
 */
function validateAndDisplayAccountTransferStatus(transferAmount) {

    const chosenAccount = getSourceAccount();
    const recipientAccount = transferRecord.transferTo;

    if (!chosenAccount || !recipientAccount || isNaN(transferAmount)) {
        return;
    }

    let msg;

    let canTransfer;
    const balance                 = formatCurrency(transferRecord.loadedBalance);
    const formattedTransferAmount = formatCurrency(transferAmount);
    let isSuccess                 = false;


    canTransfer = transferRecord.wallet.canTransfer(chosenAccount, transferAmount);

    if (!canTransfer) {
        msg = `You have an available balance of ${balance}, 
               but you're attempting to transfer ${formattedTransferAmount} to your 
                ${recipientAccount}, which exceeds your funds.`;

        toggleErrorMessage(true);
        transferRecord.canTransfer = false;


    } else {
        toggleErrorMessage(false);
        msg = `You have an available balance of ${balance}, and you can successfully 
                    transfer ${formattedTransferAmount} to your ${recipientAccount}.`;
        isSuccess = true;
        transferRecord.canTransfer = true;

    }
    updateTransferMessageStatus(msg);
    toggleTransferMessage(true, isSuccess);


}



// get functions

function getSourceAccount() {
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


export function getWalletFromCacheOrLoadFromLocalStorage() {

    if (!config.loadFromCache) {
        console.log("A request was made to reload the data from the localStorage");
    }

    if (config.isFundsUpdated || !config.loadFromCache) {

        console.log("The funds were updated, fetching the updated balance from the localStorage.");
        transferRecord.wallet = Wallet.loadWallet(config.SORT_CODE, config.ACCOUNT_NUMBER) // cache
        config.isFundsUpdated = false;

        if (!config.loadFromCache) {
            config.loadFromCache = true;
        }
        return transferRecord.wallet;

    }

    if (!transferRecord.wallet) {

        console.log("Not found, loading the from localStorage");
        transferRecord.wallet = Wallet.loadWallet(config.SORT_CODE, config.ACCOUNT_NUMBER)// cache
        return transferRecord.wallet;

    }

    console.log("Getting the wallet from the cache");
    return transferRecord.wallet;

}



// toggle functions

function toggleSelectDestinationIfSame(e) {
    const selectValue = e.target.value;
    const BANK_ID = "bank";
    const WALLET_ID = "wallet";

    if (selectValue === BANK_ID) {

        transferToBankSelectOptionElement.disabled = true;
        transferToWalletSelectOptionElement.disabled = false;

    } else if (selectValue === WALLET_ID) {

        transferToBankSelectOptionElement.disabled = false;
        transferToWalletSelectOptionElement.disabled = true;

    }
}

/**
 * Toggles between several messages to indicate whether a card has sufficient funds for a transfer.
 * 
 * @param {Number | float} amount - The amount to funds status.
 */
function toggleCardFundsStatus(amount, accountType, card = null) {

    if (amount === null) {
        warnError("toggleCardFundsStatus", `The amount cannot be null. Expected a value but got ${amount}`);
        return;
    }

    if (!accountType) {
        warnError("toggleCardFundStatus", `One or more of the values are empty: amount -${amount}, account type: ${accountType}`);
        return;
    }

    const canTransfer = transferRecord.wallet.canTransfer(accountType, amount);

    if (canTransfer === null) {
        return;
    }

    canTransfer ? cardEligibilityMessage(amount) : cardIneligibilityMessage();

}


function toggleErrorMessage(show = false) {
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



function toggleErrorMessageHelper(show, element) {
    element = element.classList;
    show ? element.add("show") : element.remove("show");
}


function toggleCardAreaDisplay(show = true) {
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
        warnError("handleDisableMatchingTransferOption", "The wallet wasn't found");
        return;
    }

    ifTransferFromIsSelectFieldIsClickHandle(e, wallet);

}



// valldate methods
function validateAndToggleFundsStatus() {
    const transferAmount = getTransferAmountValue();
    const accountChosen  = getSourceAccount();
    const MINIMUM_AMOUNT = 0.01

    if (transferAmount > MINIMUM_AMOUNT && accountChosen) {
        toggleCardFundsStatus(transferAmount, accountChosen);
    }
}


function validateTransferInput() {

    const accountChosen = getSourceAccount();
    const transferCardsCount = getTransferCardsCount();
    const transferAmount = getTransferAmountValue();
    const isAmountInvalid = isNaN(transferAmount);

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



/**
 * Performs a transfer between the wallet and bank.
 * If the recipient account is "bank", the function transfers from wallet to bank.
 * Otherwise, it assumes transfer from bank to wallet.
 *
 * @param {Object} wallet - The wallet instance containing transfer methods.
 * @param {string} recipientAccount - The destination account type ("bank" or "wallet").
 * @param {number} amount - The amount to transfer.
 *
 * @returns {boolean} Whether the transfer was successful.
 */
function performTransfer(wallet, recipientAccount, amount) {

    if (recipientAccount === "bank") {
        logTransferDirection("wallet", "bank");
        return wallet.transferFromWalletToBank(amount);
    } else {
        logTransferDirection("bank", "wallet");
        return wallet.transferFromBankToWallet(amount);
    }
}


/**
 * Logs the direction of the transfer.
 *
 * @param {string} from - The source account.
 * @param {string} to - The destination account.
 */
function logTransferDirection(from, to) {
    console.log(`transferring from ${from} to ${to}`);
}


/**
 * Resets the 'Transfer To' select dropdown to its default state.
 * Also hides the card area display.
 */
function resetTransferToSelect() {
    transferToSelectElement.value = ""; // This sets it back to the default option
    toggleCardAreaDisplay(false);
}


export function handleTransferCloseIcon(e) {
    if (e.target.id !== "transfer-close-icon") {
        return;
    }
    openWindowsState.isTransferCardWindowOpen = false;
    resetSelectFields();
    toggleCardAreaDisplay(false);
    toggleTransferMessage(false);
    clearBlockedCardMessages();
    updatePerCountCardValue(RESET_VALUE);
    updateTransferCardCount(RESET_VALUE);
    updateTransferAmountLabelValueUI(RESET_VALUE)
   
    transferDivElement.classList.remove("show");

}

function resetSelectFields() {
    transferFromSelectElement.selectedIndex = 0;         
    transferToSelectElement.selectedIndex   = 0;
}


/**
 * Removee the blocked messages
 * @param {*} 
 */
function clearBlockedCardMessages() {
    
    transferErrorMessageContainer.querySelectorAll("span").forEach((spanElement) => {
        if (spanElement) {
            spanElement.remove();
        }
    })

}


function addMessage(message, id, isErrorMsg=false) {
   
    const spanTag = document.createElement("span");

    if (isErrorMsg) {
        spanTag.classList.add("red")
    }

    spanTag.classList.add("center");
    spanTag.id = id;

    spanTag.textContent = message;

    transferErrorMessageContainer.appendChild(spanTag)
}




function toggleMessage(id, show=false) {
    const pMessageElement = document.getElementById(id);
    if (!pMessageElement) {
        return null;
    }

    if (show) {
        pMessageElement.style.display = "block";
    } else {
        pMessageElement.style.display = "none";   
    }
    return true;
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
    checkIfHTMLElement(transferTotalAmountLabelUIElement, "The label for the transfer amount");
    checkIfHTMLElement(amountPerCardAmount, "The amount per card element");
    checkIfHTMLElement(previewModeElement, "The elements for the preview");
    checkIfHTMLElement(errorMessageElement, "The error message for the incorrect funds");
    checkIfHTMLElement(cardMessageElement, "The error message for the cards funds");
    checkIfHTMLElement(transferProgressContainer, "Transfer progress container");
    checkIfHTMLElement(transferDivElement, "The transfer div container element");
    checkIfHTMLElement(transferCloseIconElement, "The icon element responsible for closing the transfer div");
    checkIfHTMLElement(transferErrorMessageContainer, "The container containing transfer form")

}
