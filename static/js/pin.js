
import { checkIfHTMLElement, dimBackground } from "./utils.js";
import { sanitizeText } from "./utils.js";
import { Wallet } from "./wallet.js";
import { logError } from "./logger.js";
import { showNewCardForm} from "./add-new-card.js";
import { AlertUtils } from "./alerts.js";
import { cards } from "./cardsComponent.js";


const pinElement                     = document.getElementById("pin");
const dimBackgroundElement           = document.querySelector(".dim-background");
const pinFormElement                 = document.getElementById("pin-form");
const pinFormIconElement             = document.getElementById("pin-form-icon");
const pinErrorMsg                    = document.getElementById("pin-error-msg");
const pinInputElement                = document.getElementById("pinInputField");
const cardFormElement                = document.getElementById("card-form");
const removableSelectableCardsDiv    = document.getElementById("selectable-cards");
const removeDivElement               = document.getElementById("remove-cards");
const removeCardsDivCloseIconElement = document.getElementById("remove-close-icon");


const ADD_FUNDS_ID     = "add-funds";
const ADD_NEW_CARD     = "add-new-card";
const TRANSFER_FUNDS   = "transfer-funds";
const REMOVE_CARD      = "remove-card";

validatePageElements();


pinElement.addEventListener("submit", handlePinFormSubmission);

let PIN_ENTERED = false;

export function handlePinShowage(e, wallet) {
   const id = e.target.id;

   if (id !== ADD_FUNDS_ID && id !== ADD_NEW_CARD && id !== TRANSFER_FUNDS && id !== REMOVE_CARD) {
        return;
   }

   if (!PIN_ENTERED) {
        showPinErrorMsg('', false);
        pinElement.classList.add("show");
        dimBackground(dimBackgroundElement, true);
        return;
   }

   if (id === ADD_NEW_CARD) {
     dimBackground(dimBackgroundElement, true);
     showNewCardForm(e);
     return;
     
   }

   if (id === REMOVE_CARD) {
    
     
     removeDivElement.classList.add("show");
     removableSelectableCardsDiv.classList.add("show");

     const cardsToRemoveElements = cards.createCardsToRemove(wallet);
     cards.placeCardDivIn(removableSelectableCardsDiv, cardsToRemoveElements, true);

    
   }

   if (id === ADD_FUNDS_ID || id === TRANSFER_FUNDS ) {
    AlertUtils.showAlert({
        title: "Feature Not Implemented",
        text: "You are seeing this because the functionality is not yet available.",
        icon: "warning",
        confirmButtonText: "OK",
    });
     return;
   }
 
}


export function handlePinFormSubmission(e, wallet) {
    
    if (e.target.id == null) {
        return;
    }
    e.preventDefault();
    const TIME_IN_MS = 1000;

    if (!(wallet instanceof Wallet)) {
        logError("handlePinFormSubmission", "The wallet instance is not an instance of Wallet");
        return;
    }
    
    const formData  = new FormData(pinFormElement);
    const pin       = formData.get("pin");
    
    if (!pin) {
        showPinErrorMsg('', false);
        return;
    }

    const isCorrect = wallet.verifyPin(pin);

    if (!isCorrect)  {
        const msg = "The pin entered is incorrect";
        showUnlockIcon(isCorrect);
        showInputErrorColor();
        showPinErrorMsg(msg);
        return;
    } 

    showUnlockIcon(isCorrect);
    showInputErrorColor(false);
    showPinErrorMsg('', false);

    if (isCorrect && pinFormElement.checkValidity()) {
        PIN_ENTERED = true;
        setTimeout(() => {
            removePinForm();

            }, TIME_IN_MS);
        
    }
    

}


export function handlePinFormClosure(e) {
    const CANCEL_BTN_ID = "cancel-pin";

    if (e.target.id != CANCEL_BTN_ID) {
        return;
    }

    removePinForm();
}

export function handleSantizationOfInputField(e) {
    const PIN_ID = "pinInputField";

    if (e.target.id != PIN_ID) {
        return;
    }
    e.target.value = sanitizeText(e.target.value, true);
  

}



function showUnlockIcon(show) {
    let icon;
    if (show) {
        icon = "http://127.0.0.1:5500/static/images/icons/unlocked.svg";
    } else {
        icon = "http://127.0.0.1:5500/static/images/icons/lock.svg";   
    }
    pinFormIconElement.src = icon;
}

function showPinErrorMsg(msg, show=true) {
    if (show) {
        pinErrorMsg.textContent = msg;
        pinErrorMsg.classList.add("show");
        return;
    }
    
    pinErrorMsg.textContent = msg;
    pinErrorMsg.classList.remove("show");
}


function removePinForm() {
    dimBackground(dimBackgroundElement);
    pinElement.classList.remove("show");
}


function showInputErrorColor(show=true, color="red") {
    pinInputElement.style.borderColor  = show ? color : "black";
   
}


export function handleRemoveCloseIcon(e) {
    const WINDOW_CLOSE_ICON = "remove-close-icon";

    if (e.target.id === WINDOW_CLOSE_ICON) {
        removeDivElement.classList.remove("show")
    }
}


function validatePageElements() {
    checkIfHTMLElement(pinElement, "Pin element");
    checkIfHTMLElement(dimBackgroundElement, "Dim background element");
    checkIfHTMLElement(pinFormElement, "Pin form element");
    checkIfHTMLElement(pinFormIconElement, "pin icon element");
    checkIfHTMLElement(pinErrorMsg, "The pin error message element");
    checkIfHTMLElement(pinInputElement, "The pin input element");
    checkIfHTMLElement(cardFormElement, "The card form element");
    checkIfHTMLElement(removableSelectableCardsDiv, "Removable cards div");
    checkIfHTMLElement(removeDivElement, "The remove div element");
    checkIfHTMLElement(removeCardsDivCloseIconElement, "The remove div close element");
}