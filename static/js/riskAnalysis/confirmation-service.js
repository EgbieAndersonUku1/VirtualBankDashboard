import { cache } from "./rules/utils.js";
import { AlertUtils } from "../alerts.js";



/**
 * Checks whether a request has already been processed.
 *
 * If the request has already been actioned, an informational alert is displayed.
 *
 * @param {boolean} isRequestAlreadyProcessed - Indicates whether the request has already been processed.
 * @returns {boolean} True if the request has already been processed; otherwise false.
 * @throws {Error} If the supplied value is not a boolean.
 */
export function hasRequestAlreadyBeenProcessed(isRequestAlreadyProcessed) {

    const isRequestAlreadyProcessedType = typeof isRequestAlreadyProcessed;

    if (typeof isRequestAlreadyProcessed !== "boolean") {
        throw new Error(`Expected the callback result to be a boolean. Got a return type of ${isRequestAlreadyProcessedType} `)
    }

    if (isRequestAlreadyProcessed) {

        AlertUtils.showAlert({
            title: "Request already processed",
            text: "This request has already been actioned.",
            icon: "info",
            confirmButtonText: "OK"
        });

        return true;
    }

    return false;
}





/**
 * Builds the confirmation dialog content based on the current risk analysis state.
 *
 * Selects the appropriate message and icon for the confirmation prompt.
 *
 * @param {Object} dialogConfig - Configuration containing dialog messages and warning criteria.
 * @returns {{promptQuestion: string, icon: string}} The dialog message and icon to display.
 */
export function buildConfirmationDialogConfig(dialogConfig) {

    const { missingDataMessage, warningDecision, warningMessage, defaultMessage } = dialogConfig;

    const data = cache.getCacheData();

    let promptQuestion;

    let icon = "warning";

    if (data === undefined) {
        promptQuestion = missingDataMessage;
        icon = "info";
    } else if (data.decision === warningDecision) {
        promptQuestion = warningMessage;
    } else {
        promptQuestion = defaultMessage;
        icon = "info";
    }

    return { promptQuestion, icon };
}




/**
 * Displays a confirmation dialog and returns the user's response.
 *
 * @param {Object} options - Confirmation dialog options.
 * @param {string} options.promptQuestion - The message displayed to the user.
 * @param {string} options.icon - The alert icon to display.
 * @param {string} [options.title="Confirm request"] - Dialog title.
 * @param {string} [options.confirmButtonText="Confirm"] - Confirm button text.
 * @param {string} [options.cancelButtonText="Cancel"] - Cancel button text.
 * @param {string} [options.successMessage="Request successfully updated"] - Success message shown after confirmation.
 * @param {string} [options.cancelMessage="No action taken"] - Message shown when the action is cancelled.
 * @returns {Promise<boolean>} True if the user confirms; otherwise false.
 */
export async function runConfirmationPrompt({ promptQuestion,
    icon,
    title = "Confirm request",
    confirmButtonText = "Confirm",
    cancelButtonText = "Cancel",
    successMessage = "Request successfully updated",
    cancelMessage = "No action taken"
}) {


    const confirmed = await AlertUtils.showConfirmationAlert({
        title: title,
        text: promptQuestion,
        icon: icon,
        cancelMessage: cancelMessage,
        confirmButtonText: confirmButtonText,
        denyButtonText: cancelButtonText,
        messageToDisplayOnSuccess: successMessage,
    });

    return confirmed;
}


