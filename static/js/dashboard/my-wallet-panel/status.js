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
import { warnError } from "../../logger.js";
import { toggleElement } from "../../utils.js";
import { WalletWizard } from "./connect-wallet.js";

const statusWalletDisconnectPanel = document.getElementById("dashboard__status");
const disconnectConfirmaionPanel = document.getElementById("wallet-disconnection-confirmation");
const disconnectInputFieldElement = document.getElementById("wallet-disconnect-inputfield");




const BUTTON_MAP = {
    DISCONNECT_BTN: "disconnect-btn",
    CONFIRM_DISCONNECT_BTN: "confirm-disconnect-btn",
    CANCEL_DISCONNECT_BTN: "cancel-disconnect-btn",
    DISCONNECTION_MODAL_CLOSE_BTN: "disconnection-modal-close-btn",
    DASHBOARD_STATUS_MODAL_CLOSE_BTN: "dashboard-status-modal-close-btn",
    REFRESH_CONNECTION_BTN: "refresh-connection-btn",
    TEST_CONNECTION_BTN: "test-connection-btn",
    CONNECT_MODAL_CLOSE_BTN: "connect-modal-close-btn",
    WALLET_STATUS: "disconnect-wallet-status",
};



/**
 * Handles clicks on status buttons.
 * Delegates the click to toggleStatusPanel.
 * @param {MouseEvent} event - The click event.
 * @returns {void}
 */
export function handleStatusButtonClick(event) {

     if (event.target.id === BUTTON_MAP.WALLET_STATUS) {
        statusWalletDisconnectPanel.classList.add("show");
        return;
    }

    const buttonID = event.target.closest("button")?.id;
    
    switch (buttonID) {
        case BUTTON_MAP.DISCONNECT_BTN:
            toggleElement({ element: disconnectConfirmaionPanel });
            disconnectInputFieldElement.focus();
            break;

        case BUTTON_MAP.CONFIRM_DISCONNECT_BTN:
            handleDisconnecectionConfirmationButton();
            break;

        case BUTTON_MAP.CANCEL_DISCONNECT_BTN:
            toggleElement({ element: disconnectConfirmaionPanel, show: false });
            break;

        case BUTTON_MAP.DISCONNECTION_MODAL_CLOSE_BTN:
            closeConfirmationPanel();
            break;

        case BUTTON_MAP.DASHBOARD_STATUS_MODAL_CLOSE_BTN:
            closeStatusPanels();
            break;

        case BUTTON_MAP.REFRESH_CONNECTION_BTN:
            handleRefreshConnection();
            break;

        case BUTTON_MAP.TEST_CONNECTION_BTN:
            handleTestConnection();
            break;

        case BUTTON_MAP.CONNECT_MODAL_CLOSE_BTN:
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
        icon: "warning",
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
        icon: "info",
        confirmButtonText: "Run test",
        messageToDisplayOnSuccess: "Wallet connection is working!",
        denyButtonText: "Cancel test",
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
        icon: "warning",
        confirmButtonText: "Refresh connection",
        messageToDisplayOnSuccess: "Wallet connection refreshed successfully.",
        denyButtonText: "Cancel refresh",
        cancelMessage: "No changes were made."
    });
}