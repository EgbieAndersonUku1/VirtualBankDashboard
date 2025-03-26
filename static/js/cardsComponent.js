import { checkIfHTMLElement, checkNumber } from "./utils.js";
import { logError } from "./logger.js";
import { Wallet } from "./wallet.js";
import { prepareCardData } from "./walletUI.js";


const CARD_IMAGES = {

    visa: {
        src: "static/images/icons/visa.svg",
        alt: "Visa card logo",
       
    },

    mastercard: {
        src: "static/images/icons/mastercard.svg",
        alt: "Mastercard logo",
    },

    discover: {
        src: "static/images/icons/discover.svg",
        alt: "Discover logo",
    }
    
}


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
    createCardDiv: (cardDetails) => {
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

        try {
            locationDiv.appendChild(cardDiv);
            return true;
        } catch (error) {
            logError("cards.placeCardDivIn", `An error occurred while appending the card div: ${error.message}`);
            return false;
        }
    },

    createNoCardDiv: (id) => {
        return noCardToRemoveDiv(id)
    },

    createXnumbersOfCardDiv: (numToCreate, divToAppendTo) => {
        if (!checkIfHTMLElement(divToAppendTo, "The div to append to is not a valid html")){
            throw new Error("Invalid div element")
        }

        console.log(checkNumber(numToCreate))
        if (!checkNumber(numToCreate).isInteger || !(checkNumber(numToCreate).isNumber)) {
            throw new Error(`The number to create divs is not an integer. Expected integer but got ${typeof numToCreate}`);
        }
        for (let i=0; i <= numToCreate; i++) {
            const noCardDiv = cards.createNoCardDiv(i + 1);
            if (noCardDiv) {
                divToAppendTo.appendChild(noCardDiv);
            }
            
        }
    }, 

    createCardsToRemove: (wallet) => {

        if (!wallet || !(wallet instanceof Wallet)) {
            const error = "The wallet is either empty or not an instance of wallet"
            logError("createCardsToRemove", error);
            throw new Error(error);
        }

        const fragment = document.createDocumentFragment()
        
        const storedCards = wallet.getAllCards();

        for (const cardNumber in storedCards) {
            if (cardNumber) {
                const card = storedCards[cardNumber];
                const cardData = prepareCardData(card);
                const cardElement = cards.createCardDiv(cardData);
                console.log(cardElement)
                if (cardElement) {
                    fragment.appendChild(cardElement)
                }

            }
        }

        if (wallet.numOfCardsInWallet < parseInt(wallet.maximumCardsAllow)) {
            cards.createXnumbersOfCardDiv(wallet.numOfCardsInWallet, fragment);
        }

        return fragment;
    }
};



function createSingleCreateCard(cardDetails) {

    const cardDiv        = document.createElement("div");
    const cardHeadDiv    = createCardHeadDiv(cardDetails)
    const cardBodyDiv    = createCardBodyDiv(cardDetails);
    const cardFooterDiv  = createFooterDiv(cardDetails);

    cardDiv.appendChild(cardHeadDiv);
    cardDiv.appendChild(cardBodyDiv);
    cardDiv.appendChild(cardFooterDiv);

    cardDiv.classList.add("card", "bank-card", cardDetails.cardBrand.toLowerCase());
    cardDiv.ariaLabel = `${cardDetails.cardName} card`;
    return cardDiv;
}





function createCardHeadDiv(cardDetails) {

    const headDivElement         = document.createElement("div");
    const cardAmountDivElement   = document.createElement("div");
    const spanBankLogoElement    = document.createElement("span");
    const spanCardAmountElement  = document.createElement("span");
    const imageElement           = createImageElementBasedOnCardType(cardDetails);

    headDivElement.classList.add("head", "flex-space-between");
    cardAmountDivElement.classList.add("card-amount", "flex-direction-column");
    
    spanCardAmountElement.className   = "card-amount";
    spanBankLogoElement.textContent   = cardDetails.bankName;
    spanCardAmountElement.textContent = cardDetails.cardAmount;

    cardAmountDivElement.appendChild(spanBankLogoElement);
    cardAmountDivElement.appendChild(spanCardAmountElement);

    headDivElement.appendChild(cardAmountDivElement);
    headDivElement.appendChild(imageElement);
    return headDivElement;
}


function createCardBodyDiv(cardDetails) {

    const bodyDivElement              = document.createElement("div");
    const imgElement                  = document.createElement("img");
    const spanCardTypeElement         = document.createElement("span");
    const spanCardNumberElement       = document.createElement("span");
    const hiddenInputField            = document.createElement("input");

    bodyDivElement.className          = "body";
    imgElement.src                    = "static/images/icons/sim-card-chip.svg";
    spanCardTypeElement.textContent   = cardDetails.cardType;
    spanCardNumberElement.textContent = cardDetails.cardNumber;
    hiddenInputField.hidden           = true;
    hiddenInputField.name             = "card";
    hiddenInputField.value            = cardDetails.cardNumber;

    imgElement.className              = "card-icon";
    imgElement.alt                    = "Sim card chip";

    spanCardTypeElement.classList.add("card-type", "capitalize");
    spanCardTypeElement.textContent   = cardDetails.cardType;

    spanCardNumberElement.classList.add("card-account-number", "highlight-number");

    bodyDivElement.appendChild(hiddenInputField);
    bodyDivElement.appendChild(imgElement);
    bodyDivElement.appendChild(spanCardTypeElement);
    bodyDivElement.appendChild(spanCardNumberElement);

    return bodyDivElement;

}



function createImageElementBasedOnCardType(cardDetails) {


    const imgElement = document.createElement("img");
    const cardBrand  = cardDetails.cardBrand.toLowerCase();
    
    if (CARD_IMAGES[cardBrand]) {

        imgElement.src = CARD_IMAGES[cardBrand].src;
        imgElement.alt = CARD_IMAGES[cardBrand].alt;

    } else {

        imgElement.src = "";
        imgElement.alt = "";
    }
    
    imgElement.className = "card-icon";
    return imgElement;

}


function createFooterDiv(cardDetails) {


    const footerDivElement    = document.createElement("div");
    const spanCardNameElement = document.createElement("span");
    const spanCardExpiry      = document.createElement("span");
    const spanCardExpiryDate  = document.createElement("span");

    footerDivElement.classList.add("footer", "flex-space-between", "padding-top-md");
    spanCardNameElement.classList.add("card-expiry", "capitalize");

    spanCardExpiry.classList.add("card-expiry", "capitalize");
    spanCardExpiryDate.className    = "date";

    spanCardExpiry.textContent      = "Expiry date"
    spanCardNameElement.textContent = cardDetails.cardName;
    spanCardExpiryDate.textContent  = ` ${cardDetails.expiryMonth} ${cardDetails.expiryYear}`;

    footerDivElement.appendChild(spanCardNameElement);
    spanCardExpiry.appendChild(spanCardExpiryDate);
    footerDivElement.appendChild(spanCardExpiry);

    return footerDivElement;

}


function noCardToRemoveDiv(id) {

    const divElement   = document.createElement("div");
    const spanElement  = document.createElement("span");
    const imgElement   = document.createElement("img");
    const smallElement = document.createElement("small");

    divElement.className = "card";
    divElement.id        = `removable-cards__card${id}`;

    spanElement.classList.add("center", "capitalize", "red");
    smallElement.textContent = "No card to remove";
    spanElement.appendChild(smallElement);

    imgElement.src       = "static/images/icons/credit-card.svg";
    imgElement.alt       = "removable card icon";
    imgElement.className = "removable-card-icon";

    divElement.appendChild(spanElement);
    divElement.appendChild(imgElement);
    return divElement;

}