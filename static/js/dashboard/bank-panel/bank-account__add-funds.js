// -----------------------------------------------------------------------------
// Bank Dashboard Architecture
// -----------------------------------------------------------------------------
//
// The main dashboard is composed of several sections:
//
// - My Bank Account
//      • Add Funds
//      • View Transactions
// - My Wallet
//      • Connect Wallet
//      • Status
// - My Credit Cards Overview
//
// The primary controller for the dashboard is "bank-dashboard.js". To prevent
// that file from becoming overly large and difficult to maintain, each section
// of the dashboard is implemented in its own module.
//
// Each module is responsible for a specific feature and exports the functions
// required by "bank-dashboard.js". This modular approach:
//
// • Keeps the main dashboard file manageable
// • Improves readability
// • Makes debugging and feature updates easier
//
// This module handles the **Bank Account → Add Funds** functionality.
//
// Exported functions:
//
//    handleBankFundInput(e)
//    handleBankCardTypes(e)
//    handleFundAccountBtn(e)
//    handleToggleAddFundsPanel(e)
//
// -----------------------------------------------------------------------------



import { checkIfHTMLElement, deselectAllElements, selectElement, toggleElement } from "../../utils.js";
import { AlertUtils } from "../../alerts.js";

const amountInputField          = document.getElementById("account-card__amount");
const bankCardSelectionTypes    = document.querySelectorAll(".account-card");
const addFundsToBankPanel       = document.getElementById("bank-account-add-funds");


// hidden form values
const MAX_TRANSFER_AMOUNT = 1_000_000;


// TODO add one time checker here for one time static element check
amountInputField.addEventListener("keydown", handleEnter);


/**
 * Handles the Enter key press on the amount input field.
 * 
 * When the Enter key is pressed, the function ensures that the input value
 * is within the defined minimum and maximum limits. It also formats it to two
 * decimal places.
 * 
 * @param {KeyboardEvent} event - The keyboard event triggered by a key press.
 */
function handleEnter(event) {
    if (event.key !== "Enter") return;

    const maxAmount = 1000000;
    const minAmount = 0;

    let value = Number(amountInputField.value) || 0;
    value = Math.min(Math.max(value, minAmount), maxAmount);

    amountInputField.value = value.toFixed(2);
}




/**
 * Handles clicks on the plus and minus buttons for the bank fund input.
 *
 * This function:
 * 1. Checks the ID of the clicked element.
 * 2. If the "plus" button is clicked, increments the amount input field by 1 (default).
 * 3. If the "minus" button is clicked, decrements the amount input field by 1.
 *
 * @param {MouseEvent} event - The click event triggered on the plus or minus button.
 *
 * @example
 * // Attach this handler to the plus and minus buttons
 * plusButton.addEventListener('click', handleBankFundInput);
 * minusButton.addEventListener('click', handleBankFundInput);
 */
export function handleBankFundInput(e) {

    switch (event.target.id) {
        case "plus":
            adjustCurrencyInput(amountInputField);
            break;
        case "minus":
            adjustCurrencyInput(amountInputField, -1);
            break;

    }

}



/**
 * Handles the selection of bank card types when a user interacts with an account card.
 * 
 * This function checks if the clicked card is one of the expected account types 
 * (savings account, debit card, or wallet). If it is, it deselects all other 
 * bank card types and selects the clicked card.
 * 
 * @param {Event} event - The event triggered by user interaction (e.g., click).
 */
export function handleBankCardTypes(event) {
    const accountCardSelector = ".account-card";
    const accountCard = event.target.closest(`${accountCardSelector}`);

    const expectedAccountTypes = ["savings-account", "debit-cards", "wallet"]

    if (!expectedAccountTypes.includes(accountCard?.dataset.account)) return;
    if (!checkIfHTMLElement(accountCard, "account card")) return;

    deselectAllElements(bankCardSelectionTypes, "active");
    selectElement(accountCard, "active")

}




/**
 * Handles the "Add Funds" button click for transferring money to the user's bank account
 * when the add funds button is clicked. The functions shows a confirmation message
 * before and after the transfer
 * 
 * @param {Event} event - The click event triggered by the user.
 */
export async function handleFundAccountBtn(event) {
    const buttonId = "account_card__add_funds-btn";
    if (event.target.id !== buttonId) return;

    const amount = amountInputField.value;
    if (!amount || amount <= 0) return;


    if (amount > MAX_TRANSFER_AMOUNT) {
        resetTransferAmountToDefault();
        AlertUtils.showAlert({
            title: "Transfer amount too high",
            text: `The amount you entered exceeds the maximum allowed transfer of £${MAX_TRANSFER_AMOUNT.toLocaleString()}. Please enter an amount up to £${MAX_TRANSFER_AMOUNT.toLocaleString()}.`,
            icon: "warning",
            confirmButtonText: "OK",
        });


        return;
    }

    const confirmed = await AlertUtils.showConfirmationAlert({
        title: "Do you want to proceed?",
        text: `You about to transfer £${amount} to your bank account, do you want to proceed?`,
        confirmButtonText: "Transfer funds",
        messageToDisplayOnSuccess: "The funds have been transferred",
        denyButtonText: "Cancel Transfer",
        cancelMessage: "No action taken."
    });

    if (confirmed) {
        // This will be replaced with a fetch and at the momemnt it is simply a placeholder
        console.log("Funds have been transferred");
        clearAmountInputField();
    }

}


/**
 * Clears the amount input field by setting its value to an empty string.
 */
export function clearAmountInputField() {
    amountInputField.value = "";
}




/**
 * Handles toggling the "Add Funds" panel open or closed based on which element is clicked.
 * 
 * Depending on the clicked button, this function either opens or closes the add funds panel.
 * 
 * @param {Event} e - The click event triggered by the user.
 */
export function handleToggleAddFundsPanel(event) {
    const closeBtnId = "add-funds-close-panel";
    const addFundsBtn = "add-funds-bank";

    switch (event.target.id) {

        case closeBtnId:
            closeAddFundsPanel();
            break;
        case addFundsBtn:
            openAddFundsPanel();
            break;
    }
}



/**
 * Opens the "Add Funds" panel.
 * 
 * This function toggles the visibility of the add funds panel and sets focus 
 * to the amount input field for immediate user input.
 */
function openAddFundsPanel() {
    toggleElement({ element: addFundsToBankPanel });
    amountInputField.focus(); // Focus input for convenience
}



/**
 * Closes the "Add Funds" panel.
 * 
 * This function hides the add funds panel by setting its visibility to false.
 */
function closeAddFundsPanel() {
    toggleElement({ element: addFundsToBankPanel, show: false }); // Hide the panel
}




/**
 * Adjusts a currency input value by a specified number of pennies.
 * The function increase or decrease the amount by `0.01`. It also
 * assures that amount doesn't pass the maximum amount or minimum 
 * threshold
 *
 *
 * @param {HTMLInputElement} amountInputField - The input element containing the currency amount.
 * @param {number} [deltaPennies=1] - Number of pennies to adjust by.
 *        Use positive values to increase and negative values to decrease.
 * @param {number} - The maximum number the field cannot exceed by. Default 1,000,000
 * @param {number} - The minimun number the field cannot go below by. Default -
 *
 * @example
 * stepCurrencyInput(input, 1);   // Increase by £0.01
 * stepCurrencyInput(input, -1);  // Decrease by £0.01
 */
function adjustCurrencyInput(amountInputField, deltaPennies = 1, maxAmount = 1_000_000, minAmount = 0) {

    const current = Number(amountInputField.value) || 0;

    const pennies = Math.round(current * 100);
    const newAmount = (pennies + deltaPennies) / 100;


    if (newAmount > maxAmount || newAmount < minAmount) return;

    amountInputField.value = newAmount.toFixed(2);
}