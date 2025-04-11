import { checkIfHTMLElement } from "./utils.js";
import { Wallet } from "./wallet.js";
import { config } from "./config.js";
import { logError, warnError } from "./logger.js";
import { getSelectedSidebarCardState } from "./sidebarCard.js";
import { cards } from "./cardsComponent.js";
import { Card } from "./card.js";
import { prepareCardData } from "./walletUI.js";



const selectAccountTransferToElement = document.getElementById("select-transfer-type");
const selectCardDivElement           = document.getElementById("select-card-div");
const transferFormElement            = document.getElementById("transfer-amount-form");
const transferringCardElement        = document.querySelector("#transferring-card .bank-card");
const selectCardElement              = document.getElementById("select-card");
const transferToElement              = document.getElementById("transferring-to");

validatePageElements()

document.addEventListener(selectAccountTransferToElement, handleSelectAccountTransferElement);


const wallet = Wallet.loadWallet(config.SORT_CODE, config.ACCOUNT_NUMBER);



export function handleSelectAccountTransferElement(e) {
    if (e.target.id !== "select-transfer-type") {
        return;
    }

    const selectValue     = e.target.value?.toLowerCase().trim();
    const CARD_SELECTOR   = "cards";
    const BANK_SELECTOR   = "bank"
    const WALLET_SELECTOR = "wallet";

    selectCardDivElement.classList.remove("show");

  
    if (selectValue  === CARD_SELECTOR) {
        selectCardDivElement.classList.add("show");

        const numbersToExclude =  getSelectedSidebarCardState().lastCardClickeCardNumber;
        const cardNumbers = getAvailableCardNumbers([numbersToExclude]);
        loadCardNumbersIntoSelect(cardNumbers);
        return;
    
    }

    if (selectValue === BANK_SELECTOR ) {
       showBankDiv();
       return;
    }

    if (selectValue === WALLET_SELECTOR) {
        showWalletDiv();
        return;
    }
  
}


function getAvailableCardNumbers(exclude = []) {
    if (!Array.isArray(exclude)) {
        logError("getAvailableCardNumbers", `Expected an array. Got ${typeof exclude}`);
        return [];
    }

    if (wallet.numOfCardsInWallet > 0) {
        return Object.keys(wallet.cardNumbers).filter(
            cardNumber => !exclude.includes(cardNumber)
        );
    }
   
}


function loadCardNumbersIntoSelect(cardNumbers) {

   
    
    const SELECT_ID       = "select-card"
    let selectCardElement = selectCardDivElement.querySelector(`#${SELECT_ID}`);

    if (!checkIfHTMLElement(selectCardElement)) {
        logError("loadCardNumbersIntoSelect", "Select element not found. Creating a new one.");
        createSelectElement(SELECT_ID, selectCardDivElement);

      
    } else {
        selectCardElement.innerHTML = ""; // Clear previous options
    }


    if (!Array.isArray(cardNumbers) || cardNumbers.length === 0 || cardNumbers === undefined) {
        selectCardElement.appendChild(createDefaultOption("No cards found to select"));
        return;
    }

    
    attachSelectEventListenerIfNotAttached(selectCardDivElement);

    const fragment = document.createDocumentFragment();
    fragment.appendChild(createDefaultOption("Select a card"));


    cardNumbers.forEach((cardNumber, index) => {
        const option       = document.createElement("option");
        option.value       = cardNumber;
        option.textContent = `Card ${index + 1} • #${cardNumber}`;
        fragment.appendChild(option);
    });

    selectCardElement.appendChild(fragment);
}


function createSelectElement(id, parentContainerToAppendTo) {
    selectCardElement = document.createElement("select");
    selectCardElement.id = id;
    parentContainerToAppendTo.appendChild(selectCardElement);
}

function createDefaultOption(text) {
    const defaultOption = document.createElement("option");
    defaultOption.disabled = true;
    defaultOption.selected = true;
    defaultOption.textContent = text;
    return defaultOption
}


function attachSelectEventListenerIfNotAttached(selectCardElement) {
    if (!selectCardElement.dataset.listenerAttached) {
        selectCardElement.addEventListener("change", handleSelectCardElement);
        selectCardElement.dataset.listenerAttached = "true";
    }
}


export function handleSelectCardElement(e) {
    const TRANSFER_TO_ID = "select-card";

    if (e.target.id === TRANSFER_TO_ID) {
        const selectValue = e.target.value;
        if (selectValue) {

            const card        = Card.getByCardNumber(selectValue);
            const cardData    = prepareCardData(card);
            const cardElement = cards.createCardDiv(cardData);
            cards.placeCardDivIn(transferToElement, cardElement, true);
        }
        
    }
}


function showBankDiv() {
    renderTransferIcon("static/images/icons/university.svg", "bank");
}


function showWalletDiv() {
    renderTransferIcon("static/images/icons/wallet.svg", "wallet");
}



function renderTransferIcon(imgSrc, accountName) {

    if (!imgSrc || typeof imgSrc !== "string") {
        warnError("renderTransferIcon", "Expected an image string but got none. Setting it empty ");
        imgSrc = "";
    }

    if (!accountName || typeof accountName !== "string") {
        warnError("renderTransferIcon", "Expected an image string but got none. Setting it to empty ");
        accountName = "";
    }


    const divContainer   = document.createElement("div");
    const pElement       = document.createElement("p")
    const img            = document.createElement("img");

    img.src              = imgSrc;
    img.alt              = accountName;
    pElement.textContent = accountName;
    pElement.className   = "capitalize";

    img.classList.add("center", "card-icon");

    divContainer.classList.add("center", "flex-direction-column");

    divContainer.appendChild(img);
    divContainer.appendChild(pElement)

    transferToElement.innerHTML = "";
    transferToElement.appendChild(divContainer);
}




function validatePageElements() {
    checkIfHTMLElement(selectAccountTransferToElement, "The select card element for selecting elements");
    checkIfHTMLElement(selectCardDivElement, "The select element for picking a card");
    checkIfHTMLElement(transferFormElement, "The transform element");
    checkIfHTMLElement(transferringCardElement, "The card that will be transferring the money");
    checkIfHTMLElement(transferToElement, "The transfer to element");

}