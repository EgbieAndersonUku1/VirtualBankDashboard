import { checkIfHTMLElement, checkNumber } from "./utils.js";
import { logError, warnError } from "./logger.js";
import { Wallet } from "./wallet.js";
import { Card } from "./card.js";
import { prepareCardData } from "./walletUI.js";
import { toTitle } from "./utils.js";


const removableCardAreaElement   = document.getElementById("removable-card-area");
let removalCardDisplayMsgElement = document.getElementById("no-cards-to-remove");


validatePageElements();

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
     * the card div to the location div. If either element is invalid, an error is logged. Optionally, it can 
     * clear the location div before appending the new card div.
     *
     * @function placeCardDivIn
     * @param {HTMLElement} locationDiv - The DOM element where the card div should be appended.
     * @param {HTMLElement} cardDiv - The card div element that will be added to the location div.
     * @param {boolean} [clearBeforeAppend=false] - If true, clears the location div before appending the card div.
     */

    placeCardDivIn: (locationDiv, cardDiv, clearBeforeAppend = false) => {

        if (!checkIfHTMLElement(locationDiv, "Location card div") ||  !checkIfHTMLElement(cardDiv, "Card div element")) {
            logError("cards.placeCardDivIn", "An error occurred trying to place card div element inside the given location");
            return;
        }

        try {
            if (clearBeforeAppend) {
                locationDiv.innerHTML = "";
              
            }
            locationDiv.appendChild(cardDiv);
            return true;
        } catch (error) {
            logError("cards.placeCardDivIn", `An error occurred while appending the card div: ${error.message}`);
            return false;
        }
    },

    /**
     * Creates and returns a "no card to remove" div element.
     * 
     * @param {string} id - The ID to assign to the created div.
     * @returns {HTMLElement} - The generated "no card to remove" div element.
     */
    _createNoCardDiv: (id) => {
        return noCardToRemoveDiv(id)
    },


    /**
     * Creates and appends a specified number of empty card divs to a given parent element.
     * 
     * @param {number} numToCreate - The number of empty card divs to create.
     * @param {HTMLElement} divToAppendTo - The parent element to append the created divs to.
     * @throws {Error} Throws an error if `divToAppendTo` is not a valid HTML element.
     * @throws {Error} Throws an error if `numToCreate` is not a valid integer.
     */
    _createXnumberofEmptyCardDivs: (numToCreate, divToAppendTo) => {
        if (!checkIfHTMLElement(divToAppendTo, "The div to append to is not a valid html")){
            throw new Error("Invalid div element")
        }
      
        if (!checkNumber(numToCreate).isInteger || !(checkNumber(numToCreate).isNumber)) {
            throw new Error(`The number to create divs is not an integer. Expected integer but got ${typeof numToCreate}`);
        }
        for (let i=0; i < numToCreate; i++) {
            const noCardDiv = cards._createNoCardDiv(i + 1);
            if (noCardDiv) {
                divToAppendTo.appendChild(noCardDiv);
            }
            
        }
    }, 

    /**
     * Generates card elements based on the number of cards in the user's wallet.
     * If the wallet contains fewer cards than its maximum capacity, empty card 
     * placeholders are created to fill the remaining slots.
     * 
     * @param {Wallet} wallet - The wallet instance containing the user's cards.
     * @returns {DocumentFragment} A document fragment containing the card elements.
     * @throws {Error} Throws an error if `wallet` is not provided or is not an instance of `Wallet`.
     */
    createCardsToShow: (wallet) => {

        if (!wallet || !(wallet instanceof Wallet)) {
            const error = "The wallet is either empty or not an instance of wallet"
            logError("createCardsToShow", error);
            throw new Error(error);
        }

        const fragment    = document.createDocumentFragment();
        const storedCards = wallet.getAllCards();
       
        // if there are no cards to create, create an x-amount of empty card based
        // on the maximum wallet sizes
        if (wallet.numOfCardsInWallet === 0) {
            cards._createXnumberofEmptyCardDivs(wallet.maximumCardsAllow, fragment);
            return fragment;
        }

        let cardsDivCreated = 0;

        // Create the number cards div based on the number of cards in the given wallet
        for (const cardNumber in storedCards) {
            if (cardNumber) {

                const card        = storedCards[cardNumber];
                const cardData    = prepareCardData(card);
                const cardElement = cards.createCardDiv(cardData);
                
                if (cardElement) {
                    fragment.appendChild(cardElement);
                    cardsDivCreated += 1;
                }

            }
        }

        // Fill the remaining slots with empty card divs.
        // Example: If the wallet can hold up to 3 cards but the user only has 1,
        // create 2 additional empty card placeholders.
        const emptyDivsToCreate = wallet.maximumCardsAllow - cardsDivCreated;
        if (emptyDivsToCreate != 0) {
            cards._createXnumberofEmptyCardDivs(emptyDivsToCreate, fragment);
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
    cardDiv.ariaLabel          = `${cardDetails.cardName} card`;
    cardDiv.dataset.cardNumber = cardDetails.cardNumber;

    const cardOverlay = document.createElement("div");
    cardOverlay.id    = `card_${cardDetails.id}`;

    cardDiv.appendChild(cardOverlay);

    if (cardDetails.isCardBlocked) {
        applyCardBlockStatus(cardDiv, cardDetails);
    }
   
    return cardDiv;
}


export function applyCardBlockStatus(cardDiv, cardDetails) {
    if (!cardDiv) {
        logError("applyCardBlockStatus", "Expected a card div element but got null");
        return;
    }

    if (!checkIfHTMLElement(cardDiv, "Card div element")) {
        return;
    }

    // console.log(cardDiv)

    const ID        = `card_${cardDetails.id}`;
    let cardOverlay = cardDiv.querySelector(`#${ID}`);
    

    if (!cardOverlay) {
        warnError("applyCardBlockStatus", "Card overlay div not found creating the overlay div")
        cardOverlay           = document.createElement("div");
        cardOverlay.id        = ID;

        cardDiv.appendChild(cardOverlay);
    }

    cardOverlay.classList.add("card-overlay");
    cardOverlay.textContent = "Blocked";

    cardDiv.classList.remove("card-is-blocked", "card-not-blocked");
    cardDiv.classList.add("card-is-blocked");
    
}




export function removeCardBlockStatus(cardDiv, cardDetails) {
    if (!checkIfHTMLElement(cardDiv, "Card div")) {
        return;
    }

    const ID = `card_${cardDetails.id}`
    // console.log(cardDiv);

    const cardOverlay = cardDiv.querySelector(`#${ID}`);

    if (cardOverlay) {

        const CLASS_NAME  = "card-overlay";
        cardOverlay.classList.remove(CLASS_NAME);
        cardOverlay.textContent = "";
        cardDiv.classList.remove("card-is-blocked");

    }

   
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
  
    
    spanElement.appendChild(smallElement);

    imgElement.src       = "static/images/icons/credit-card.svg";
    imgElement.alt       = "removable card icon";
    imgElement.className = "removable-card-icon";

    divElement.appendChild(spanElement);
    divElement.appendChild(imgElement);
    return divElement;

}




/**
 * Responsible for creating, adding, modify or delete rows on a given
 * table
 */
export const removeCardTable = {
    _isTableCreated:false,
    _table: null,
    _tbodyElement: null,

    /**
     * Checks if a table hasn't already been created and creates a table.
     * if there is already a table it does nothing.
     */
    createTable() {
       
        if (!removeCardTable._isTableCreated && removeCardTable._table == null) {
    
            const table       = document.createElement("table");
            const tHeader     = removeCardTable._createTableTHead();
            const thBody      = removeCardTable._createTableBody();

            table.appendChild(tHeader);
            table.appendChild(thBody);

            table.id = "removable-card-table";

            removeCardTable._table = table;
            removeCardTable._isTableCreated = true;

            removeCardTable._loadTable();
            
        }

    },

    /**
     * Removes the area the given table will be added. This allows
     * any messages, tables, etc to be removed.
     */
    _clearRemovableCardArea(){
        removeCardTable._toggleTableMessage(false);
       
    },

    /**
     * A private function that creates the table headings for a giving table.
     * @returns {table} TH header table element for a given table.
     */
    _createTableTHead: () => {
    
        const tableHeaderElement  = document.createElement("thead");
        const trElement           = document.createElement("tr")
        const thIDElement         = document.createElement("th");
        const thCardHolderElement = document.createElement("th");
        const thCardNumberElement = document.createElement("th");
        const thActionElement     = document.createElement("th");

        thIDElement.textContent         = "ID";
        thCardHolderElement.textContent = "Cardholder name";
        thCardNumberElement.textContent = "Card number";
        thActionElement.textContent     = "Action";

        tableHeaderElement.appendChild(trElement);
        tableHeaderElement.appendChild(thIDElement);
        tableHeaderElement.appendChild(thCardHolderElement);
        tableHeaderElement.appendChild(thCardHolderElement);
        tableHeaderElement.appendChild(thCardNumberElement)
        tableHeaderElement.appendChild(thActionElement);

        return tableHeaderElement;

    },

    /**
     * Creates and returns the tbody of a given table element.
     * @returns {table} Returns tbody element for a given table
     */
    _createTableBody: () => {
        return document.createElement("tbody");
    },

    /**
     * Appends a new row to the table using the provided card object.
     * If the table does not exist, it will be created automatically.
     * 
     * @param {Object} card - The card object containing row data.
     * @param {number} card.id - The unique identifier for the card.
     * @param {string} card.cardHolderName - The name of the cardholder.
     * @param {string} card.cardNumber - The card number.
     */
    appendRow: (card) => {
        removeCardTable._validateCard(card);

        if (!removeCardTable._isTableCreated && !removeCardTable._table) {
            removeCardTable.createTable();
        }

        removeCardTable._toggleTable(true);

        const table               = removeCardTable._table;
        const tbody               = table.querySelector("tbody") || table;
        const rowElement          = document.createElement("tr");
        const tdIDElement         = document.createElement("td");
        const tdNameElement       = document.createElement("td");
        const tdCardNumberElement = document.createElement("td");
        const tdActionElement     = document.createElement("td");

        tdActionElement.className = "red";
       
        tdIDElement.textContent         = card.id;
        tdNameElement.textContent       = toTitle(card.cardHolderName);
        tdCardNumberElement.textContent = card.cardNumber;
        tdActionElement.textContent     = "Marked for removal";

        rowElement.appendChild(tdIDElement);
        rowElement.appendChild(tdNameElement);
        rowElement.appendChild(tdCardNumberElement);
        rowElement.appendChild(tdActionElement);

        rowElement.dataset.id = card.id.toString().trim();

        tbody.appendChild(rowElement)

    },

    
    /**
     * Validates whether the provided object is an instance of the `Card` class.
     * Throws an error if the validation fails.
     * 
     * @param {Card} card - The object to validate.
     * @throws {Error} If the provided object is not an instance of `Card`.
     */
    _validateCard: (card) => {
        if (!card || !(card instanceof Card)) {
            throw Error(`The card instance is not an instance of card ${typeof card}`);
        }
    },

   /**
     * Removes the table row associated with the given card's ID.
     * If the row is found, it is removed, and the table visibility is updated accordingly.
     * 
     * @param {Card} card - The card instance whose row should be removed.
     */
    removeRow: (card) => {
        removeCardTable._validateCard(card);
    
        if (removeCardTable._table) {
            const tbody = removeCardTable._getTBodyElement();
            const row   = Array.from(tbody.querySelectorAll("tr")).find(row => row.cells[0].textContent.trim() === card.id.toString().trim());
    
            if (row) row.remove();       

            removeCardTable.toggleTable(!removeCardTable._isTableEmpty());

        }
    },

   /**
     * Updates the specified cell for rows matching the given card IDs.
     * 
     * This method iterates through a list of card IDs, finds their corresponding table rows,
     * and updates the specified cell with the provided text. The `cellToUpdate` parameter 
     * is zero-based, meaning `3` refers to the fourth column.
     * 
     * @param {string[] | number[]} cardIDsArray - An array of card IDs whose rows should be updated.
     * @param {number} [cellToUpdate=3] - The index of the cell to update (zero-based).
     * @param {string} [textToUpdate="Successfully removed"] - The new text for the updated cell.
     * 
     * @throws {Error} If `cardIDsArray` is not an array.
     * @throws {Error} If `cellToUpdate` is not a valid integer.
     * @throws {Error} If `cellToUpdate` is out of range.
     */
    upateCellPosition: (cardIDsArray, cellToUpdate=3, textToUpdate="Successfully removed") => {
        if (!Array.isArray(cardIDsArray)) {
            logError("updateCellPosition", `The cardIDsArray is not an array. Expected an array but got ${typeof cardIDsArray}`);
            return;
        }

        const cellToCheck = checkNumber(cellToUpdate);

        if (!cellToCheck.isNumber || !cellToCheck.isInteger) {
            throw new Error(`The cellToUpdate must be a number. Expected a number but got ${typeof cellToUpdate}`);   
        }

        if (cellToUpdate > removeCardTable._table.length -1 || cellToUpdate < 0) {
            throw new Error(`The cell to update is out of range it must be between ${0} and ${removeCardTable.length -1}`);
        }

        const rowsMap = new Map();
        document.querySelectorAll("tr[data-id]").forEach(row => {
          rowsMap.set(row.getAttribute("data-id"), row);
        });

        cardIDsArray.forEach((id) => {
            const row = rowsMap.get(id);
            if (row) {

              row.cells[cellToUpdate].textContent = textToUpdate;
              row.cells[cellToUpdate].className   = "green";
             
            } 

        })

    },

    /**
     * loads the given table into the selected area. The method first
     * clears the table and then appends the given table into that area.
     */
    _loadTable: () => {
        removeCardTable._clearRemovableCardArea();
        removableCardAreaElement.appendChild(removeCardTable._table);

    },

    /**
     * Checks if the body of a given table is empty. If the table is empty returns true or
     * false otherwise
     * 
     * @returns {boolean}: Returns true if the table is empty or false otherwise.
     */
    _isTableEmpty() {
        const tbody = removeCardTable._table ? removeCardTable._getTBodyElement() : null;        
        return tbody ? tbody.rows.length === 0 : true;
    },
        
    /**
     * Toggles the table's visibility.
     * 
     * If `show` is `true`, the table is displayed, and the message is hidden.
     * If `show` is `false`, the table is hidden, and the message is shown.
     * 
     * @param {boolean} show - Determines whether the table should be visible (`true`) or hidden (`false`).
     */
    _toggleTable: (show) => {
       
        if (show) {
            removeCardTable._table.style.display = "table"; 
            removeCardTable._toggleTableMessage(false);
        } else {
            removeCardTable._table.style.display = "none";
            removeCardTable._toggleTableMessage(true);
        }
    },


    /**
     * Toggles the message's visibility.
     * 
     * If `show` is `true`, the message is show.
     * If `show` is `false`, the message is hidden.
     * 
     * @param {boolean} show - Determines whether the table should be visible (`true`) or hidden (`false`).
     */
    _toggleTableMessage: (show) => {
        removalCardDisplayMsgElement.style.display = show ? "block": "none";
        },
    

    _getTBodyElement: () => {
        if (!removeCardTable._tbodyElement) {
            removeCardTable._tbodyElement = removeCardTable._table.querySelector("tbody");
        }
        return removeCardTable._tbodyElement;
    }

}





function validatePageElements() {
    checkIfHTMLElement(removableCardAreaElement, "The removable card area");
    checkIfHTMLElement(removalCardDisplayMsgElement, "The removable message delete message");
}
