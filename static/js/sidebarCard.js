import { checkIfHTMLElement } from "./utils.js";
import { Card } from "./card.js";
import { cards } from "./cardsComponent.js";
import { logError, warnError } from "./logger.js";
import { AlertUtils } from "./alerts.js";
import { prepareCardData, loadUserCardsInUI, walletDashboard, updateAllWalletDashoardText } from "./walletUI.js";
import { maskCreditCardNo, parseErrorMessage } from "./utils.js";
import { openWindowsState, config } from "./config.js";
import { Wallet } from "./wallet.js";
import { notificationManager } from "./notificationManager.js";


const sideBarCardsManagerElement         = document.getElementById("sidebar-cards");
const sideBarCardContainerElement        = document.getElementById("sidebar-card");
const cardInfoDivElement                 = document.getElementById("card-info");
const fundMyCardElement                  = document.getElementById("fund-my-card");
const fundMyCardCloseElement             = document.getElementById("fund-card-close-icon");
const transferCardAmountContainerElement = document.getElementById("transfer-amount-card");
const transferringCardAreaElement        = document.getElementById("transferring-card");



export const selectedSidebarCard = {};

notificationManager.setKey(config.NOTIFICATION_KEY);

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

    openWindowsState.isCardManagerWindowOpen = true;

    toggleOfAllCardsExceptForClicked(cardElement);
    renderCardToUI(card);

}


export function renderCardToUI(card) {
    const cardData  = prepareCardData(card);

    if (!cardData || typeof cardData !== "object") {
        logError("handleSideBarCardClick", `Expected a card but returned either got a null 
                  or non-object. Card data - ${cardData} with type ${typeof cardData}`);
        return;

    }

    updateSelectedSidebarCardState(cardData);
    cardData.cardNumber  = maskCreditCardNo(cardData.cardNumber)
    const userCardElement = cards.createCardDiv(cardData);
    cards.placeCardDivIn(sideBarCardContainerElement, userCardElement, true);

    handleIsCardBlockedImg(userCardElement, cardData);
    renderCardDetails(cardData);
}


/**
 * Updates the shared `selectedSidebarCard` state object.
 *
 * This function acts as a persistence layer for sidebar card interactions,
 * allowing different parts of the UI to access the currently selected card.
 * It simplifies the management of related actions such as `transfer`, `delete`,
 * `fund`, and `block`, since the selected card's state is centralised and ensures
 * when any of these buttons are clicked, the app knows the exact card details.
 *
 * @param {Object} cardData - The card data for the clicked sidebar card.
 * Must contain `cardNumber`, `cardType`, and `isCardBlocked`.
 */
function updateSelectedSidebarCardState(cardData) {

    if (!cardData || typeof cardData !== "object" ) {
        warnError("updateSelectedSidebarCardState", "The card data is empty");
        return;
    }

    selectedSidebarCard.lastCardClickeCardNumber = cardData.cardNumber;
}


/**
 * Returns the current state of the selected sidebar card.
 *
 * Useful for checking which card is currently selected and accessing its metadata
 * such as card number, status, or type.
 *
 * @returns {Object} The current `selectedSidebarCard` state object.
 */
export function getSelectedSidebarCardState() {
    return selectedSidebarCard;
}


function renderCardDetails(card) {
   
    const cardSpanInfo = [
        {
            id: "card-info__card-holder-name",
            label: "Card Holder name: ",
            value: card.cardHolderName,
            isCardBlocked: card.isCardBlocked,
        },
        {
            id: "card-info__card-num",
            label: "Card Number: ",
            value: card.cardNumber,
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

    const fragment = document.createDocumentFragment();

    for (const field of cardFields) {
        const spanElement = createCardSpan(field);
        if (!spanElement) {
            warnError("renderCardInfo", "Card span element not found");
            return;
        }

        if (spanElement.id === CARD_ID) {
            handleIsCardBlockedSpanText(spanElement, field);
        }
        fragment.appendChild(spanElement);
       
    }

    cardInfoDivElement.appendChild(fragment);
  
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
    

    if (show && openWindowsState.isAnyOpen()) {
       
        // Reset `isCardManagerWindow` to false.
        // Clicking a card in the sidebar automatically sets this to true,
        // even if the Card Manager window wasn't actually opened due to a conflict (e.g., another window already open).
        // This ensures the internal state reflects the *actual* UI.
        openWindowsState.isCardManagerWindowOpen = false;
        
        if (openWindowsState.isRemoveCardWindowOpen) {
            AlertUtils.warnWindowConflict({title: "Removal Card Window Is Open",
                                          text: "The card transfer window is open, close it before opening the card manager window"})
            return;
        }
    
      
        if (openWindowsState.isTransferCardWindowOpen) {
            AlertUtils.warnWindowConflict({title: "Transfer Card Window Is Open", 
                                            text: "The card removal window is open, close it before opening the card manager window"})
            return;
        }

        if (openWindowsState.isAddFundsWindowOpen) {
            AlertUtils.warnWindowConflict({title: "Transfer Card Window Is Open", 
                text: "The add fund window is open, close it before opening the card manager window"})
            return;
        }
    
    }

    // when the card window is closed the card manager window is set to false.
    if (!show) {
        openWindowsState.isCardManagerWindowOpen = false;
    }

    show ? sideBarCardsManagerElement.classList.add("show") : sideBarCardsManagerElement.classList.remove("show")
}


export function handleCloseCardManagerButton(e) {
    
    const CLOSE_CARD_MANAGE_BTN_ID = "close-card";

    if (e.target.id === CLOSE_CARD_MANAGE_BTN_ID) {
        openWindowsState.isCardManagerWindowOpen = false;
        toggleCardManagerDiv(false);
        return;
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
export async function handleSideBarDeleteCard(e) {

    const DELETE_BUTTON_ID   = "delete";

    if (  e.target.id === DELETE_BUTTON_ID) {
      
        try {

            const resp = await AlertUtils.showConfirmationAlert({
                                title: "Delete card confirmation",
                                text: "Are you sure want to delete card?. This action is irreversable and cannot be undone.",
                                icon: "warning",
                                cancelMessage: "The card was not deleted",
                                messageToDisplayOnSuccess: "The card was successfully deleted"
                            })
           
            handleCardDeletion(resp)

        } catch (error) {
            handleDeleteCardError(error.message);
            return;
        }
    }

}

export function handleTransferAmountButtonClick(e) {
    const TRANSFER_BUTTON_ID = "transfer-card-amount";
  
    if (e.target.id === TRANSFER_BUTTON_ID) {
      
        transferCardAmountContainerElement.classList.add("show");
        
        toggleCardManagerDiv(false);

        const card = Card.getByCardNumber(getSelectedSidebarCardState().lastCardClickeCardNumber);
        if (!card) {
            logError(" handleTransferAmountButtonClick", "The source card wasn't found");
            return;
        }

        // load the source card that is card do the transferring
        const cardData    = prepareCardData(card)
        const cardElement = cards.createCardDiv(cardData);
        cards.placeCardDivIn(transferringCardAreaElement, cardElement, true);

       
    }
}




export function handleAddFundCardButtonClick(e) {
    const BUTTON_ID = "add";

    if (e.target.id !== BUTTON_ID) {
        return;
    }
 
    toggleAddMyCardForm(true);
}




export function handleAddCloseButtonIconClick(e) {
    const ADD_FUND_ID = "fund-card-close-icon";

    if (e.target.id === ADD_FUND_ID ) {
        toggleAddMyCardForm(false);
    }
    
}


function toggleAddMyCardForm(show) {
    show ? fundMyCardElement.classList.add("show") : fundMyCardElement.classList.remove("show");
}



async function handleCardDeletion(resp) {

    if (!resp) {
        return;
    }


    const cardNumber = getSelectedSidebarCardState().lastCardClickeCardNumber;

    if (!cardNumber) {
        logError("handleCardDeletion", "The card number was not found. Card not should be display since it was clicked on")
        return;
    }
   

    // remove the card from the wallet
    const wallet = Wallet.loadWallet(config.SORT_CODE, config.ACCOUNT_NUMBER);
    if (!wallet) {
        logError("handleSideBarDeleteCard", "The wallet instance wasn't found");
        return;
    }
   
    try {
        wallet.removeCardCompletely(cardNumber);
    } catch (error) {
        handleDeleteCardError(error.message);
        return;
    }
   
    loadUserCardsInUI(wallet);
    
    updateAllWalletDashoardText(wallet, false);
    toggleCardManagerDiv(false);

    notificationManager.add(`Card #${cardNumber} was successfully removed from localStorage and the wallet`);
}



function handleDeleteCardError(msg) {

    if (!msg) {
        return;
    }

    const errorMsg = parseErrorMessage(msg);

    AlertUtils.showAlert({
        title: errorMsg.title,
        text: errorMsg.text,
        icon: errorMsg.text !== "" ? "warning": "error",
        confirmButtonText: "Ok!"
    })

}





function validatePageElements() {
    checkIfHTMLElement(sideBarCardsManagerElement, "The sidebar card manager");
    checkIfHTMLElement(sideBarCardContainerElement, "The sidebar container");
    checkIfHTMLElement(cardInfoDivElement, "The card info element container");
    checkIfHTMLElement(fundMyCardElement, "The funding my card form");
    checkIfHTMLElement(fundMyCardCloseElement, "The add fund close icon");
    checkIfHTMLElement(transferCardAmountContainerElement, "The card container for the transferring card");
    checkIfHTMLElement(transferringCardAreaElement, "The card area for the transferring card");
  

}
