import { selectedCardStore }         from "./card-state-store.js";
import { cardImplementer }           from "../../card/cardBuilder.js";
import { toggleElement }             from "../../utils.js";
import { getCardDetailsFromElement } from "./card-details-extractor.js";
import { createCardDetails }         from "../../card/cardBuilder.js";



const fullCardDetailsContainer = document.getElementById("full-card-details");
const cardDetailsContainer     = document.getElementById("full-card-details-info");
const viewExtraCardInfo        = document.getElementById("view-more-bank-card");
const bankCardButtons          = document.querySelector(".view-card-panel-buttons");
const extraCardInfoPanel       = document.getElementById("view-card-panel");


/**
 * Displays the full details of the currently selected card in the side panel.
 *
 * This function:
 * 1. Retrieves the selected card from the store.
 * 2. Hides any previously displayed extra card info view.
 * 3. Creates a visual representation of the selected card and adds it to the full card details container.
 * 4. Masks sensitive card data (e.g., CVC) before creating the detailed card info element.
 * 5. Adds the detailed card info element to the side panel.
 * 6. Ensures bank card buttons are visible in the extra card view.
 *
 * @returns {void} - Exits early if no card is currently selected.
 *
 * @example
 * // Display the full details for the currently selected card
 * viewFullCardDetails();
 */
export function viewFullCardDetails() {

    const bankCardElement = selectedCardStore.get();

    if (!bankCardElement) return;

    toggleElement({ element: viewExtraCardInfo, show: false })

    const cardDetails = getCardDetailsFromElement(bankCardElement);
    const card        = cardImplementer.createCardDiv(cardDetails);

    // Add the card image to the side panel display view window
    cardImplementer.placeCardDivIn(fullCardDetailsContainer, card, true)


    cardDetails.cardStatus = bankCardElement.dataset.isActive;
    cardDetails.cvc       = "***"
    const cardDetailsElement = createCardDetails(cardDetails);

    // Add the card details to the side panel display view window
    cardImplementer.placeCardDivIn(cardDetailsContainer, cardDetailsElement, true);

    removeBankCardButtonsFromCardExtraView(false);

}



/**
 * Handles the click event for the "View More Info" button on a bank card.
 *
 * This function:
 * 1. Checks if the clicked element is the correct "View More Info" button.
 *    - If not, exits early.
 * 2. Shows the extra card info panel.
 * 3. Displays the full details of the currently selected card.
 *
 * @param {MouseEvent} e - The click event triggered on the "View More Info" button.
 *
 * @example
 * // Attach this handler to the "View More Info" button
 * viewMoreButton.addEventListener('click', handleViewMoreInfoCardClick);
 */
export function handleViewMoreInfoCardClick(e) {
    const viewMoreButtonId = "view-more-bank-card";

    if (e.target.id !== viewMoreButtonId) return;

    toggleElement({ element: extraCardInfoPanel, show: true });
    viewFullCardDetails();
}




/**
 * Shows or hides bank card buttons in the extra card view.
 *
 * @param {boolean} [remove=true] - If true, hides the buttons; if false, shows them.
 *
 * @returns {null} - Returns null if the button container does not exist.
 *
 * @example
 * // Hide bank card buttons
 * removeBankCardButtonsFromCardExtraView();
 *
 * // Show bank card buttons
 * removeBankCardButtonsFromCardExtraView(false);
 */
function removeBankCardButtonsFromCardExtraView(remove = true) {

    if (!bankCardButtons) return null;
    toggleElement({ element: bankCardButtons, show: !remove })
}

