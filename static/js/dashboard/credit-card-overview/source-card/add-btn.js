








// /**
//  * Handles clicks on buttons within a card panel.
//  *
//  * Depending on which button was clicked:
//  * 1. "card-close-btn":
//  *    - Hides the extra card info panel.
//  *    - Deselects all cards.
//  *    - Closes all related transfer panels.
//  * 2. "card-transfer-btn":
//  *    - Initiates the transfer process for the selected source card.
//  *
//  * @param {MouseEvent} e - The click event triggered by the user on a card panel button.
//  *
//  * @example
//  * // Attach this handler to the card panel container
//  * cardPanelContainer.addEventListener('click', handleCardPanelButtons);
//  */
// function handleCardPanelButtons(e) {


//     switch (e.target.id) {
//         case "card-close-btn":
//             toggleElement({ element: extraCardInfoPanel, show: fal
//                 se });
//             deselectAllCards();
//             closeAllRelatedTransferPanels()
//             break;

//         case "card-transfer-btn":
//             handleSourceCardTransfer();
//             break;
//     }
// }





// /**
//  * handleCardSelectionTimeout
//  *
//  * Automatically deselects any selected card if the card details panel 
//  * ("view-card-panel") is not opened within a specified timeout.
//  *
//  * This function waits for 5 seconds (`MILLI_SECONDS`) and then:
//  *   1. Deselects all cards using `deselectAllCards()`.
//  *   2. Hides the "view more bank card" element using `toggleElement()`.
//  *
//  * The timeout is only applied if the extra card info panel is currently hidden.
//  *
//  * Usage:
//  * Call this function after a card is selected to ensure that a card does 
//  * not remain selected indefinitely without the user viewing its details.
//  *
//  * @function
//  * @returns {void} Does not return any value.
//  */

// function handleCardSelectionTimeout() {
//     const MILLI_SECONDS = 10000;


//     // Must query elements dynamically each time because their visibility can change
//     const viewExtraCardInfo = document.getElementById("view-more-bank-card");
//     const extraCardInfoPanel = document.getElementById("view-card-panel");


//     const isSideCardPanelOpen = getComputedStyle(extraCardInfoPanel).display;

//     let timeoutId;

//     if (timeoutId) {
//         clearTimeout(timeoutId);
//         timeoutId = null;
//     }

//     if (isSideCardPanelOpen === "none") {

//         timeoutId = setTimeout(() => {
//             deselectAllCards();
//             toggleElement({ element: viewExtraCardInfo, show: false })
//         }, MILLI_SECONDS);
//         return
//     }


// }





// /**
//  * Handles changes to the transfer type select field in the transfer form.
//  *
//  * This function:
//  * 1. Checks if the changed element is the transfer type selector; if not, exits early.
//  * 2. If the selected value is not "another-card":
//  *    - Hides the card selection panel.
//  *    - Hides the transfer amount confirmation panel.
//  *    - Resets the transfer form.
//  * 3. If the selected value is "another-card":
//  *    - Shows the card selection panel.
//  *    - Retrieves the currently selected card from the store.
//  *    - Renders a message prompting the user to select a transfer card.
//  *    - Loops through the cards and displays only cards that haven't been blocked:
//  *
//  * @param {Event} e - The change event triggered on the transfer type select field.
//  *
//  * @example
//  * // Attach this handler to the transfer type selector
//  * transferTypeSelect.addEventListener('change', handleBankTransferSelectFormOptions);
//  */
// function handleBankTransferSelectFormOptions(e) {
//     if (!e.target.matches("#transfer-type")) return


//     const select = e.target;
//     const value = select.value;


//     // hide the select card panel if another option is selected.

//     switch(value) {
//         case "another-card":
//             handleAnotherCardSelectTransferFormOption();
//             cardSelectionPanelState.set(true);
//             break;
//         case "wallet":
//             closeSelectCardTransferSidePanel();
//             cardSelectionPanelState.clear();
//             transferFormSelectOption.set("Wallet");
//             break;
//         case "bank":
//              closeSelectCardTransferSidePanel();
//              cardSelectionPanelState.clear();
//              transferFormSelectOption.set("bank");
//              break

//     }

   
  
// }



// /**
//  * Handles the click event for the transfer confirmation button.
//  *
//  * When the user clicks the confirmation button:
//  * 1. Displays a confirmation alert to verify if the user wants to proceed with the transfer.
//  * 2. If confirmed:
//  *    - Retrieves the transfer form data (amount and note) using `getTransferFormObject`.
//  *    - Sends the data to the backend (currently simulated with console.log).
//  *    - Closes all related transfer panels to reset the UI.
//  * 3. If cancelled, no action is taken.
//  *
//  * @param {MouseEvent} e - The click event triggered by the user.
//  *
//  * @example
//  * // Attach this handler to the transfer confirmation button
//  * transferConfirmationButton.addEventListener('click', handleTransferConfirmationButtonClick);
//  */
// async function handleTransferConfirmationButtonClick(e) {

//     const buttonId = "transfer-confirmation-confirm-btn";

//     if (e.target.id !== buttonId) {
//         return;
//     }

//     const confirmed = await AlertUtils.showConfirmationAlert({
//         title: "Transfer process",
//         text: "Are you sure you want to proceed with the transfer?",
//         icon: "info",
//         cancelMessage: "No action was taken",
//         confirmButtonText: "Yes, proceed!",
//         messageToDisplayOnSuccess: "Your transfer was successfully",
//         denyButtonText: "Cancel transfer!"
//     })

//     if (confirmed) {
//         // simulation - The console log will be replaced by a real fetch API but for now it is a console.log

//         const formData = getTransferFormObject(fundsTransferForm);
//         console.log(`fetch data sent to the backend note=${formData.note} and amount amount=${formData.transferAmount}`);
//         closeAllRelatedTransferPanels();
//         return;

//     }


// }





// /**
//  * Handles the click event for the transfer cancellation button within the confrimation panel.
//  *
//  * When the user clicks the cancel button:
//  * 1. Verifies that the clicked element is the correct cancel button.
//  * 2. Closes all related transfer panels to reset the UI.
//  *
//  * @param {MouseEvent} e - The click event triggered by the user.
//  *
//  * @example
//  * // Attach this handler to the transfer cancel button
//  * transferCancelButton.addEventListener('click', handleTransferCancelConfirmationButtonClick);
//  */
// function handleTransferCancelConfirmationButtonClick(e) {
//     const buttonId = "transfer-confirmation-cancel-btn";

//     if (e.target.id !== buttonId) {
//         return;
//     }

//     closeAllRelatedTransferPanels();
// }






// /**
//  * Shows or hides the transfer amount confirmation panel.
//  *
//  * @param {boolean} [show=true] - If true, displays the confirmation panel; 
//  *                                 if false, hides it.
//  *
//  * @example
//  * // Show the confirmation panel
//  * handleTransferAmountConfirmation(true);
//  *
//  * // Hide the confirmation panel
//  * handleTransferAmountConfirmation(false);
//  */
// function handleTransferAmountConfirmation(show = true) {
//     toggleElement({ element: askTransferConfirmationPanel, show: show })

// }
