import { checkIfHTMLElement } from "./utils.js";
import { logError } from "./logger.js";


const CARD_IMAGES = {

    visa: {
        src: "static/images/icons/visa.svg",
        alt: "Visa card logo"
    },

    masterCard: {
        src: "static/images/icons/discover.svg",
        alt: "Mastercard logo",
    },

    discover: {
        src: "static/images/icons/discover.svg",
        alt: "Discover logo",
    }
    
}



/**
 * A set of utility functions for handling card elements.
 * 
 * The `cards` object provides methods to create a card and place a card element inside a specified location in the DOM.
 * 
 * @namespace cards
 */
export const cards = {

    /**
     * Creates a new card element with the specified details.
     *
     * This function delegates the creation of a single card element to another function, `createSingleCreateCard`, 
     * which takes care of the details of how the card is structured.
     *
     * @function createCard
     * @param {Object} cardDetails - An object containing the details to create the card.
     * @returns {HTMLElement} The newly created card element.
     */
    createCard: (cardDetails) => {
        return createSingleCreateCard(cardDetails);
    },

    /**
     * Places a card element into a specified location within the DOM.
     *
     * This function checks if both the location and card div elements are valid HTML elements before appending
     * the card div to the location div. If either element is invalid, an error is logged.
     *
     * @function placeCardDivIn
     * @param {HTMLElement} locationDiv - The DOM element where the card div should be appended.
     * @param {HTMLElement} cardDiv - The card div element that will be added to the location div.
     */
    placeCardDivIn: (locationDiv, cardDiv) => {
        if (!checkIfHTMLElement(locationDiv, "Location card div") ||  !checkIfHTMLElement(cardDiv, "Card div element")) {
            logError("cards.placeCardDivIn", "An error occurred trying to place card div element inside the given location");
            return;
        }
        locationDiv.appendChild(cardDiv);
    },

}




createSingleCreateCard(cardDetails) {

    const cardDiv        = document.createElement("div");
    const cardHeadDiv    = createCardHeadDiv(cardDetails)
    const cardBodyDiv    = createCardBodyDiv(cardDetails);
    const cardFooterDiv  = createFooterDiv(cardDetails);

    cardDiv.appendChild(cardHeadDiv);
    cardDiv.appendChild(cardBodyDiv);
    cardDiv.appendChild(cardFooterDiv);

    return cardDiv;
}


function createCardHeadDiv(cardDetails) {

    const headDivElement         = document.createElement("div");
    const cardAmountDivElement   = document.createElement("div");
    const spanBankLogoElement    = document.createElement("span");
    const spanCardAmountElement  = document.createElement("span");
    const imageElement           = createImageElementBasedOnCardType(cardDetails);

    headDivElement.classList.add("head", "flex-space-between");
    cardAmountDivElement.add("card-amount", "flex-direction-column");
    
    spanCardAmountElement.className   = "card-amount";
    spanBankLogoElement.textContent   = cardDetails.bankName;
    spanCardAmountElement.textContent = cardDetails.cardAmount;

    cardAmountDivElement.appendChild(spanBankLogoElement);
    cardAmountDivElement.appendChild(cardAmountDivElement);

    headDivElement.appendChild(cardAmountDivElement);
    headDivElement.appendChild(imageElement);

}


function createCardBodyDiv(cardDetails) {

    const bodyDivElement              = document.createElement("div");
    const imgElement                  = document.createElement("img");
    const spanCardTypeElement         = document.createElement("span");
    const spanCardNumberElement       = document.createElement("span");

    bodyDivElement.className          = "body";
    imgElement.src                    = "static/images/icons/sim-card-chip.svg";
    spanCardTypeElement.textContent   = cardDetails.cardType;
    spanCardNumberElement.textContent = cardDetails.cardNumber;

    imgElement.className              = "card-icon";
    imgElement.alt                    = "Sim card chip";

    spanCardTypeElement.className     = "card-type";

    spanCardNumberElement.classList.add("card-account-number", "highlight-number");

    bodyDivElement.appendChild(imgElement);
    bodyDivElement.appendChild(spanCardTypeElement);
    bodyDivElement.appendChild(spanCardNumberElement);

    return bodyDivElement;

}



function createImageElementBasedOnCardType(cardDetails) {

    const imgElement = document.createElement("img");

   switch(cardDetails) {
        case cardDetails.cardType.toLowerCase() === CARD_IMAGES.visa:
            imgElement.src = CARD_IMAGES.visa.src;
            imgElement.alt = CARD_IMAGES.visa.alt;
            break;
        
        case cardDetails.cardType.toLowerCase() === CARD_IMAGES.discover:
            imgElement.src = CARD_IMAGES.discover.src;
            imgElement.alt = CARD_IMAGES.discover.alt;
            break;
        
        case cardDetails.cardType.toLowerCase() === CARD_IMAGES.masterCard:
            imgElement.src = CARD_IMAGES.masterCard.src;
            imgElement.alt = CARD_IMAGES.masterCard.alt;
            break;
        
        default:
            imgElement.src = "";
            imgElement.alt = "";
        
        imgElement.className = "card-icon";
        return imgElement;

   }
}


function createFooterDiv(cardDetails) {


    const footerDivElement    = document.createElement("div");
    const spanCardNameElement = document.createElement("span");
    const spanCardExpiry      = document.createElement("span");
    const spanCardExpiryDate  = document.createElement("span");

    footerDivElement.classList.add("footer", "flex-space-between", "padding-top-md");
    spanCardNameElement.classList.add("card-expiry", "capitalize");
    spanCardExpiryDate.className    = "date";


    spanCardNameElement.textContent = cardDetails.cardName;
    spanCardExpiryDate.textContent  = cardDetails.cardExpiryDate;

    footerDivElement.appendChild(spanCardNameElement);
    spanCardExpiry.appendChild(spanCardExpiry);
    footerDivElement.appendChild(spanCardExpiryDate);

    return footerDivElement;

}