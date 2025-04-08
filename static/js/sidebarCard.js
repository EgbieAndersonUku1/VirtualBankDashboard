import { checkIfHTMLElement } from "./utils.js";
import { Card } from "./card.js";
import { cards } from "./cardsComponent.js";
import { logError, warnError } from "./logger.js";
import { AlertUtils } from "./alerts.js";
import { prepareCardData } from "./walletUI.js";
import { maskCreditCardNo } from "./utils.js";

const sideBarCardsManagerElement  = document.getElementById("sidebar-cards");
const sideBarCardContainerElement = document.getElementById("sidebar-card");
const cardInfoDivElement          = document.getElementById("card-info");






validatePageElements();


export function handleSidBarCardClick(e) {

    const EXPECTED_CLASS = ".bank-card";
    const cardElement    = e.target.closest(EXPECTED_CLASS);
    const SIDE_CARD_ID   = "side-cards"

    if (!cardElement) {
        return; 
    }
    const grandParentDivClass = cardElement.parentNode.parentNode;

    if (grandParentDivClass.id !== SIDE_CARD_ID) {
        return;
    }
  
 
   
    const cardNumber = cardElement.dataset.cardNumber;
    const card       = Card.getByCardNumber(cardNumber);

    if (!card) {
        logError("handleSideBarCardClick", "Expected a card but returned null");
        showInvalidCardAlertMsg();
        return;
    }

    toggleOfAllCardsExceptForClicked(cardElement);
    
    const cardData  = prepareCardData(card);

    if (!cardData || typeof cardData !== "object") {
        logError("handleSideBarCardClick", `Expected a card but returned either got a null 
                  or non-object. Card data - ${cardData} with type ${typeof cardData}`);
        return;

    }

    const userCardElement = cards.createCardDiv(cardData);
    cards.placeCardDivIn(sideBarCardContainerElement, userCardElement, true);

    handleIsCardBlockedImg(userCardElement, cardData);
    renderCardDetails(cardData)

}


function renderCardDetails(card) {
  
    const cardSpanInfo = [
        {
        id: "card-info__card-num",
        label: "Card Number: ",
        value: maskCreditCardNo(card.cardNumber),
        isCardBlocked: card.isCardBlocked,
        },
        {
          id: "card-info__card-amount",
          label: "Card Amount: ",
          value: card.cardAmount,
          isCardBlocked: card.isCardBlocked,
        },
        {
          id: "card-info__card-brand",
          label: "Card Brand: ",
          value: card.cardBrand,
          isCardBlocked: card.isCardBlocked,
        },
        {
          id: "card-info__card-type",
          label: "Card Type: ",
          value: card.cardType,
          isCardBlocked: card.isCardBlocked,
        },
        {
          id: "card-info__card-cvc",
          label: "CVC: ",
          value: card.cvc,
          isCardBlocked: card.isCardBlocked,
        },
        {
          id: "card-info__card-status",
          label: "Card Status: ",
          value: card.isCardBlocked ? "Card is blocked" : "Card is active",
          isCardBlocked: card.isCardBlocked,
        },
        {
          id: "card-info__card-creation-date",
          label: "Card Creation Date: ",
          value: card.timeStamp,
          isCardBlocked: card.isCardBlocked,
        },
      ];
      
      
      renderCardInfo(cardSpanInfo)
    
}

function renderCardInfo(cardFields) {
    
    const CARD_ID = "card-info__card-status";

    cardInfoDivElement.textContent = "";

    for (const field of cardFields) {
        const spanElement = createCardSpan(field);
        if (!spanElement) {
            warnError("renderCardInfo", "Card span element not found");
            return;
        }

        if (spanElement.id === CARD_ID) {
            handleIsCardBlockedSpanText(spanElement, field);
        }
        cardInfoDivElement.appendChild(spanElement);
       
    }
  
}


function createCardSpan(field) {
    const elementSpan     = document.createElement("span");
    elementSpan.id        = field.id;
    const spanInner       = document.createElement("span");
    spanInner.textContent = ` ${field.label}`;
    const textNode        = document.createTextNode(field.value);   
   

    spanInner.classList.add("bold", "capitalize");
    elementSpan.appendChild(spanInner);
    elementSpan.appendChild(textNode);
    elementSpan.classList.add("capitalize")

    return elementSpan
}


function handleIsCardBlockedImg(cardElement, cardData) {

    if (!checkIfHTMLElement(cardElement, "Card element for a generated card")) {
        logError("handleIsCardBlockedImg", "Card element for a generated card");
        return false;
    }

    if (typeof cardData !== "object") {
        logError("handleIsCardBlockedImg", `Card data is not an object. Expected an object but got type ${typeof cardData}`);
        return false;
    }

    if (!cardData.hasOwnProperty("isCardBlocked")) {
        logError("handleIsCardBlockedImg", `isCardBlock is not attribrute of card data`);
        return false;
    }
    cardData.isCardBlocked ? cardElement.classList.add("card-is-blocked") : cardElement.classList.add("card-not-blocked");
}



function handleIsCardBlockedSpanText(cardSpanElement, card) {
    if (!checkIfHTMLElement(cardSpanElement)) {
        return;
    }

    cardSpanElement.remove("green", "red");
    card.isCardBlocked ? cardSpanElement.classList.add("red") : cardSpanElement.classList.add("green");
}

function toggleCardManagerDiv(show=true) {
    show ? sideBarCardsManagerElement.classList.add("show") : sideBarCardsManagerElement.classList.remove("show")
}


export function handleCloseCardManagerButton(e) {
    const CLOSE_BTN_ID = "close-card";
    console.log(e.target)
    if (e.target.id === CLOSE_BTN_ID) {
        toggleCardManagerDiv(false);
    }
}


function toggleOfAllCardsExceptForClicked(cardElement) {
    const sideCardsElement   = document.querySelectorAll("#side-cards .cards .card");

    const CARD_CLASS = 'highlight-credit-card';
    sideCardsElement.forEach((card) => {
        if (card) {
            card.classList.remove(CARD_CLASS);
        }
    })

    cardElement.classList.add(CARD_CLASS);
    toggleCardManagerDiv();

}

function showInvalidCardAlertMsg() {
    AlertUtils.showAlert({title: "Card not found",
                          text: "Something went wrong, and the card was not found",
                          icon: "error",
                         confirmButtonText: "Ok!"

    })
}




// Not yet implemented
export function handleNotYetImplementedFunctionality(e) {
    const BLOCK_BUTTON_ID    = "block-card";
    const TRANSFER_BUTTON_ID = "transfer-card-amount";
    const ADD_BUTTON_ID      = "add";
    const DELETE_BUTTON_ID   = "delete";

    if (e.target.id === BLOCK_BUTTON_ID || e.target.id === TRANSFER_BUTTON_ID ||
        e.target.id === ADD_BUTTON_ID || e.target.id === DELETE_BUTTON_ID) {
        AlertUtils.showAlert({title: "Not yet implemented",
            text: "You seeing this because the functionality is not yet implemented",
            icon: "info",
            confirmButtonText: "Ok"
        })
    }
}



function validatePageElements() {
    checkIfHTMLElement(sideBarCardsManagerElement, "The sidebar card manager");
    checkIfHTMLElement(sideBarCardContainerElement, "The sidebar container");
    checkIfHTMLElement(cardInfoDivElement, "The card info element container");
  

}
