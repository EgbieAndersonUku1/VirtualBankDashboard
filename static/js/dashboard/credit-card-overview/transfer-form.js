import { warnError } from "../../logger.js";
import { cardSelectionPanelState, selectedCardStore } from "./card-state-store.js";
import { getCardDetailsFromElement } from "./card-details-extractor.js";
import { parseCurrency, formatCurrency } from "../../utils.js";



/**
 * Renders the transfer confirmation panel.
 *
 * Displays the selected source card, recipient type,
 * and formatted transfer amount.
 *
 * @param {Object} formData
 * @param {string|number} formData.transferAmount
 * @param {string} recipientType
 */
function updateConfirmationPanel(formData, recipientType) {

  
    // If recipient account is nulll it means that the user has selected "bank" or "wallet" from the select transfer form
    if (recipientType === null || typeof recipientType !== "string")  {
        warnError("updateConfirmationPanel", {
            recipientType: recipientType,
            type: typeof recipientType,
            expected: "Expected a string value",
            
        })
        return;
      
    } 

    sourceCardNumberElement.textContent = getCardDetailsFromElement(selectedCardStore.get()).cardNumber;
    targetCardNumberElement.textContent = recipientType;
    transferAmountElement.textContent   = formatCurrency(formData.transferAmount)

}


/**
 * Resolves the recipient account for the current transfer.
 *
 * If a recipient type is selected from the transfer form that is used excluding "another-card".
 *  The options are "another-card", "wallet" or "bank" that value is returned.
 * 
 * However, If "bank" or "wallet" wasn't selected the recipient type becomes (null), 
 * and the function falls back to the "another-card" as the selection picked
 *
 *
 * @returns {string|null} The resolved recipient account identifier,
 * or null if none can be determined.
 */
function getRecipientAccountType() {

    const recipientType = transferFormSelectOption.getSelection();
    let transferToAccount;

    if (recipientType === null) {

        const targetCardHiddenValue = document.getElementById("transfer-to-card-number")

        if (!(sourceCardNumberElement && targetCardNumberElement && transferAmountElement)) {

            warnError("updateConfirmationPanel", {
                sourceCardNumberElement: sourceCardNumberElement,
                targetCardNumberElement: targetCardNumberElement,
                transferAmountElement: transferAmountElement,
            })
            return;
         }

         transferToAccount = targetCardHiddenValue && targetCardHiddenValue !== undefined ? targetCardHiddenValue.value : null
    } else {
        transferToAccount = recipientType;
    }
    return transferToAccount
}




/**
 * Shows or hides the transfer amount confirmation panel.
 *
 * @param {boolean} [show=true] - If true, displays the confirmation panel; 
 *                                 if false, hides it.
 *
 * @example
 * // Show the confirmation panel
 * handleTransferAmountConfirmation(true);
 *
 * // Hide the confirmation panel
 * handleTransferAmountConfirmation(false);
 */
function handleTransferAmountConfirmation(show = true) {
    toggleElement({ element: askTransferConfirmationPanel, show: show })

}



/**
 * Validates that both a source and a target card have been selected for a transfer.
 *
 * This function performs two checks:
 * 1. Ensures that both `sourceCardId` and `targetCardId` are provided.
 *    - If either is missing, an alert is shown and a warning is logged.
 * 2. Ensures that the source and target cards are not the same.
 *    - If they are the same, it means a target card was never selected in the panel, and 
 * an alert is shown and a warning is logged.
 *
 * @param {Object} params - The parameters object.
 * @param {string|number} params.sourceCardId - The ID of the source card.
 * @param {string|number} params.targetCardId - The ID of the target card.
 * @param {string} [params.context="assertTransferSelection"] - Optional context for logging warnings.
 *
 * @returns {boolean} - Returns `true` if the transfer selection is valid; otherwise, `false`.
 *
 * @example
 * const isValid = assertTransferSelection({
 *   sourceCardId: selectedSourceCardId,
 *   targetCardId: selectedTargetCardId
 * });
 * if (isValid) {
 *   // Proceed with transfer
 * }
 */
function assertTransferSelection({
    sourceCardId,
    targetCardId,
    context = "assertTransferSelection"
}) {

  
    if (!sourceCardId || !targetCardId) {
        AlertUtils.showAlert({
            title: "Unable to continue",
            text: "Please select a source card and a target card to complete the transfer.",
            icon: "error",
            confirmButtonText: "OK"
        });

        warnError(context, {
            code: "TRANSFER_MISSING_CARD",
            sourceCardId,
            targetCardId
        });

        return false;
    }

    // If the Source card id equals the target card id, it means that the target card was never selected
    if (sourceCardId === targetCardId) {
        AlertUtils.showAlert({
            title: "Invalid transfer",
            text: "Please select a target card to complete the transfer.",
            icon: "error",
            confirmButtonText: "OK"
        });

        warnError(context, {
            code: "TRANSFER_SAME_CARD",
            cardId: sourceCardId
        });

        return false;
    }

    return true;
}





/**
 * 
 * Checks if the source card (card dong the transferring) 
 * has a valid balance 
 * 
 * */
function assertSourceCardHasFunds() {
    let sourceCard = selectedCardStore.get();
    if (!sourceCard) return;

    sourceCard  = getCardDetailsFromElement(sourceCard)
    const amount = parseCurrency(sourceCard.cardAmount);

    if (isNaN(amount) || amount <= 0) {
        AlertUtils.showAlert({
            title: "Invalid balance",
            text: "The card balance is insufficient and a transfer cannot be inititated.",
            icon: "error",
            confirmButtonText: "OK",
        });
        return false;
    }
    return true;
}



/**
 * Handles the submission of the transfer form.
 *
 * This function:
 * 1. Extracts source and target card IDs from hidden input fields.
 * 2. Validates the card selection using `assertTransferSelection`.
 *    - If validation fails, the function exits early.
 * 2. Shows the transfer amount confirmation panel.
 * 2. Updates the confirmation panel with the current transfer details.
 *
 * @param {Event} e - The form submission event.
 *
 * @example
 * // Attach this handler to the transfer form
 * fundsTransferForm.addEventListener('submit', handleTransferForm);
 */
export function handleTransferForm(e) {
    e.preventDefault(); 

    // console.log("I am in the transfer form")

    if (cardSelectionPanelState.isPanelOpen()) {

        const hiddenInputFieldSelector = ".transfer-hidden-field";
        const hiddenInputValue = Array.from(document.querySelectorAll(hiddenInputFieldSelector));

        const [sourceCardId, targetCardId] = extractSourceAndCardIdFromHiddenField(hiddenInputValue);

        const resp = assertTransferSelection({ sourceCardId: sourceCardId, targetCardId: targetCardId })

        if (!resp) return;
    
    }

    const hasFunds = assertSourceCardHasFunds();
    if (!hasFunds) return;


    handleTransferAmountConfirmation();
    const recipientAccount = getRecipientAccountType()
    updateConfirmationPanel(getTransferFormObject(fundsTransferForm), recipientAccount);

}



/**
 * Extracts the source and target card IDs from a collection of hidden input elements.
 *
 * Expects an array-like object (e.g. NodeList or Array) where:
 * - index 0 contains the source card input
 * - index 1 contains the target card input
 *
 * If the input is missing, invalid, or contains fewer than two elements,
 * the function safely returns [null, null].
 *
 * @param {Array|NodeList} hiddenInputValue
 *     A collection of hidden input elements containing card IDs.
 *
 * @returns {[string|null, string|null]}
 *     A tuple containing:
 *     - sourceCardId
 *     - targetCardId
 */
function extractSourceAndCardIdFromHiddenField(hiddenInputValue) {

    const EXPECTED_RETURN_VALUE = 2;
    if (!hiddenInputValue || hiddenInputValue.length < EXPECTED_RETURN_VALUE) {
        return [null, null];
    }

    return [
        hiddenInputValue[0].value ?? null,
        hiddenInputValue[1].value ?? null
    ];
}





/**
 * Returns an object containing only the required fields from the transfer form.
 *
 * @param {HTMLFormElement} transferForm - The funds transfer form element.
 * @returns {Object} An object with the "transfer-amount" and "note" fields.
 *
 * @example
 * const formObject = getTransferFormObject(fundsTransferForm);
 * // formObject = { "transfer-amount": "100", "note": "Payment for invoice #123" }
 */
function getTransferFormObject(transferForm) {
    const requiredFields = ["transfer-amount", "note"];
    return parseFormData(new FormData(transferForm), requiredFields);
}

