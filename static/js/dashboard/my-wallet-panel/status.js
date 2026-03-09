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
// This module handles the **My Wallet → Status** functionality.
//
// Exported functions:
//
//    handleStatusButtonClick
//
// -----------------------------------------------------------------------------

import { AlertUtils } from "../../alerts.js";
import { toggleElement } from "../../utils.js";
import { WalletWizard } from "./connect-wallet.js";

const statusWalletDisconnectPanel = document.getElementById("dashboard__status");
const disconnectConfirmaionPanel = document.getElementById("wallet-disconnection-confirmation");
const disconnectInputFieldElement = document.getElementById("wallet-disconnect-inputfield");



/**
 * Handles clicks on status buttons.
 * Delegates the click to toggleStatusPanel.
 * @param {MouseEvent} event - The click event.
 * @returns {void}
 */
export function handleStatusButtonClick(event) {

     if (event.target.id === "disconnect-wallet-status") {
        statusWalletDisconnectPanel.classList.add("show");
        return;
    }

    const buttonID = event.target.closest("button")?.id;
    
    switch (buttonID) {
        case "disconnect-btn":

            toggleElement({ element: disconnectConfirmaionPanel });
            disconnectInputFieldElement.focus()
            break;
        case "confirm-disconnect-btn":
            handleDisconnecectionConfirmationButton();
            break;
        case "cancel-disconnect-btn":
            toggleElement({ element: disconnectConfirmaionPanel, show: false });
            break;
        case "disconnection-modal-close-btn":
            closeConfirmationPanel();
            break;
        case "dashboard-status-modal-close-btn":
            closeStatusPanels();
            break;
        case "refresh-connection-btn":
            handleRefreshConnection();
            break;
        case "test-connection-btn":
            handleTestConnection();
            break;
        case "connect-modal-close-btn":
            WalletWizard.closeModal();
            break;
    }
}





/**
 * Closes all wallet-related status panels and clears input fields.
 * @returns {void}
 */
function closeStatusPanels() {
    toggleElement({ element: statusWalletDisconnectPanel, show: false })
    closeConfirmationPanel();
    clearDisconnectInputField();
}


/**
 * Closes the disconnect confirmation panel.
 * @returns {void}
 */
function closeConfirmationPanel() {
    toggleElement({ element: disconnectConfirmaionPanel, show: false })
}



/**
 * Clears the input field used for confirming wallet disconnection.
 * @returns {void}
 */
function clearDisconnectInputField() {
    disconnectInputFieldElement.value = "";
}



/**
 * Handles the confirmation process for disconnecting a wallet.
 * @async
 * @returns {Promise<void>}
 */
async function handleDisconnecectionConfirmationButton() {
    const expectedWord = "disconnect";

    if (!disconnectInputFieldElement) return;
    if (disconnectInputFieldElement.value.length < expectedWord.length) return;
    if (disconnectInputFieldElement.value.toLowerCase() !== expectedWord) return;

    const confirmed = await AlertUtils.showConfirmationAlert({
        title: "Are you sure you want to disconnect wallet?",
        text: "This action will disconnect your wallet from your bank, and stop all information.",
        confirmButtonText: "Disconnect wallet",
        messageToDisplayOnSuccess: "The wallet has been disconnected",
        denyButtonText: "Cancel Disconnect",
        cancelMessage: "No action taken."
    });

    if (confirmed) {
        closeStatusPanels();
        WalletWizard.closeModal();
    }
}



/**
 * Handles testing the wallet connection.
 * Shows a confirmation alert and displays a success message if confirmed.
 * @async
 * @returns {Promise<void>}
 */
async function handleTestConnection() {
    const confirmed = await AlertUtils.showConfirmationAlert({
        title: "Test wallet connection?",
        text: "This will test if your wallet connection is working properly.",
        confirmButtonText: "Run test",
        messageToDisplayOnSuccess: "Wallet connection is working!",
        denyButtonText: "Cancel",
        cancelMessage: "No changes were made."
    });
}




/**
 * Handles the wallet connection refresh action.
 * Shows a confirmation alert and displays a success message if confirmed.
 * @async
 * @returns {Promise<void>}
 */
async function handleRefreshConnection() {
    const confirmed = await AlertUtils.showConfirmationAlert({
        title: "Refresh wallet connection?",
        text: "This will refresh your current wallet connection.",
        confirmButtonText: "Refresh connection",
        messageToDisplayOnSuccess: "Wallet connection refreshed successfully.",
        denyButtonText: "Cancel",
        cancelMessage: "No changes were made."
    });
}