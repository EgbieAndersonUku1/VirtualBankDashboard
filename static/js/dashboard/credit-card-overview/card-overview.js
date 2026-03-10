
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
// This module handles the **Card overview → card click ** → view more card functionality.
//
// Exported functions:
//
//   handleCardClick
//   handleViewMoreInfoCardClick from card view in bank-dashobard.js
// // -----------------------------------------------------------------------------



import { selectedCardStore }         from "./card-state-store.js";
import { getElementFromCache }       from "./card-dom-cache.js";
import { getCardDetailsFromElement } from "./card-details-extractor.js";
import { warnError }                 from "../../logger.js";
import {
    selectElement,
    deselectAllElements,
    toggleElement
} from "../../utils.js";


// ==============================
// DOM References / Constants
// ==============================

const viewExtraCardInfo     = document.getElementById("view-more-bank-card");
let creditCardsNodeElements = document.querySelectorAll(".bank-card");


// ==============================
// Public Controller API
// ==============================

/**
 * Handles a click on a card by delegating to the appropriate card click handlers.
 *
 * This function:
 * 1. Processes clicks in the credit card overview panel.
 * 2. Processes clicks in the transfer card selection panel.
 *
 * Essentially, what it does is it centralizes all card click logic by calling:
 *  - `processCreditCardOverviewClick`
 *  - `processSelectedCardClick`
 *
 * @param {MouseEvent} event - The click event triggered on a card element.
 *
 * @example
 * cardContainer.addEventListener('click', handleCardClick);
 */
export function handleCardClick(event) {
  
    const card = event.target.closest(".bank-card");
    if (!card) return;

    const isTransferCard = card.classList.contains("bank-transfer-card");

    if (isTransferCard) {
        processSelectedCardClick(event);
        return;
    }

    processCreditCardOverviewClick(event);
}


// ==============================
// Controller Logic
// ==============================

/**
 * Handles a click on a credit card in the overview panel.
 */
function processCreditCardOverviewClick(e) {

    const bankCardClass = "bank-card";
    const excludeClass = "bank-transfer-card";

    const bankCardElement = getSelectableCardElement(e, bankCardClass, excludeClass);

    if (bankCardElement === null) return;

    const cardVisibleSelector = "is-selected";

    deselectAllCards();
    selectElement(bankCardElement, cardVisibleSelector);

    selectedCardStore.set(bankCardElement);
    toggleElement({ element: viewExtraCardInfo });
}


/**
 * Handles a click on a card within the transfer card selection panel.
 */
function processSelectedCardClick(e) {

    const bankCardClass = "bank-card";
    const cssSelector   = "is-selected";

    const targetCard = getSelectableCardElement(e, bankCardClass);

    if (!targetCard) return;

    const transferCreditCardElement =
        getElementFromCache("#bank-funds-transfer__select-cards-panel .bank-transfer-card");

    deselectAllCards(transferCreditCardElement, cssSelector);
    selectElement(targetCard, cssSelector);

    updateTransferHiddenFields(targetCard);
}


/**
 * Updates the card the transfer card within the selection panel.
 */
function updateTransferHiddenFields(targetCard) {

    const {
        transferToHiddenValueField,
        sourceCardHiddenValueField,
        targetCardHiddenNumberValueField
    } = getHiddenElementsFromCache();

    if (!(transferToHiddenValueField && sourceCardHiddenValueField)) {

        warnError(
            "updateTransferHiddenFields",
            "One or more transfer hidden fields are missing."
        );

        return;
    }

    const selectedCard = selectedCardStore.get();

    const sourceCardDetails = getCardDetailsFromElement(selectedCard);
    const targetCardDetails = getCardDetailsFromElement(targetCard);

    if (!targetCardDetails || Object.keys(targetCardDetails).length === 0) {

        warnError("updateTransferHiddenFields", {
            targetCardDetails
        });

        return;
    }

    sourceCardHiddenValueField.value = sourceCardDetails.cardId;
    transferToHiddenValueField.value = targetCardDetails.cardId;
    targetCardHiddenNumberValueField.value = targetCardDetails.cardNumber;
}




// ==============================
// Internal Helpers
// ==============================

/**
 * Returns the closest selectable card element from an event target.
 */
function getSelectableCardElement(event, baseClass, excludedClass) {

    const element = event.target.closest(`.${baseClass}`);
    if (!element) return null;

    if (excludedClass && element.classList.contains(excludedClass)) {
        return null;
    }

    return element;
}


/**
 * Deselects all cards in the provided card elements list.
 */
function deselectAllCards(
    cardsNodeElements = creditCardsNodeElements,
    cardVisibleSelector = "is-selected"
) {
    deselectAllElements(cardsNodeElements, cardVisibleSelector);
}


/**
 * Retrieves frequently used hidden input elements from the DOM via cache.
 */
function getHiddenElementsFromCache() {

    return {
        transferToHiddenValueField: getElementFromCache("transfer-to-card-id"),
        sourceCardHiddenValueField: getElementFromCache("source-card"),
        targetCardHiddenNumberValueField: getElementFromCache("transfer-to-card-number")
    };
}



