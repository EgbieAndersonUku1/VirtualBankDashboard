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
// This module handles the **Bank Account → View transactions** functionality.
//
// Exported functions:
//
//    handleToggleViewBankTransactionPanel(event)
// -----------------------------------------------------------------------------

import { toggleElement } from "../../utils.js";

const viewBankTransacionPanel = document.getElementById("bank-account-view-transactions");
const buttonCache = {
    view:null,
    close: null,
}



/**
 * Handles clicks on the view and close buttons for the bank transaction panel.
 *
 * If the user clicks the "view transaction" button or the "close transaction" button,
 * this function toggles the visibility of the bank transaction panel. Clicks on any
 * other part of the document are ignored.
 *
 * This function also supports clicks on child elements inside the buttons using `closest`.
 *
 * @param {MouseEvent} event - The click event object.
 * @returns {void} - Does not return a value; toggles panel visibility as a side effect.
 */
export function handleToggleViewBankTransactionPanel(event) {


    const viewTransactionButtonId = "view-transaction-btn";
    const closePanelId = "close-transaction-panel";


    if (buttonCache.view === null && buttonCache.close === null) {
    
          console.log("Empty button elements found populating and caching to avoid repeated DOM queries");
          buttonCache.view = event.target.closest(`#${viewTransactionButtonId}`);
          buttonCache.close = event.target.closest(`#${closePanelId}`);
    }
  
    if (!buttonCache.view && !buttonCache.close) {
        console.log("View transaction button and close transaction button are not applicable exisiting");
        return;
    };

    if (event.target.id === viewTransactionButtonId) {
        toggleElement({ element: viewBankTransacionPanel });
        return;
    }

    if (closePanelId) {
    
        toggleElement({ element: viewBankTransacionPanel, show: false });
    }




}
