
import { checkIfHTMLElement, dimBackground, applyDashToInput, sanitizeText  } from "./utils.js";
import { parseFormData } from "./formUtils.js";
import { Card } from "./card.js";
import { cards } from "./cardsComponent.js";

const cardFormElement        = document.getElementById("card-form");
const formMsgErrorElement    = document.getElementById("new-card-error");
const cardNumberInputElement =  document.getElementById("card-number");
const cardsDiv               = document.getElementById("cards")
const submitBtnElement       = document.getElementById("create-card-btn");

validatePageElements();

let isSubmitButtonClick = false;


cardFormElement.addEventListener("submit", handleCardFormSubmission);
submitBtnElement.addEventListener("click", handleSubmitBtnClick);


function handleSubmitBtnClick(e) {
    const CREATE_CARD_BTN_ID = "create-card-btn";

    if (e.target.id === CREATE_CARD_BTN_ID) {
        isSubmitButtonClick = true;
    }
}


export function handleCardFormSubmission(e, wallet) {

    e.preventDefault();

    if (!cardFormElement.checkValidity() && isSubmitButtonClick) {
        isSubmitButtonClick = false;
        showFormErrorMsg();
        return;
    }

    if (isSubmitButtonClick) {

    showFormErrorMsg(false);
    const formData = new FormData(cardFormElement);
    const requiredFields = [
                "card-name",
                "card-number",
                "expiry-month",
                "expiry-year",
                "card-option",
                "card-type",
                "cvc"
        
            ];

     
    const parsedFormData = parseFormData(formData, requiredFields);

    let card;
    try {
        card = Card.createCard(parsedFormData.cardName, 
            parsedFormData.cardNumber, 
            parsedFormData.expiryMonth,
            parsedFormData.expiryYear,
            parsedFormData.cvc,
            )
    } catch (error) {
        showFormErrorMsg(true, error.message);
        return;
    }
  
    
    if (!card) {
        logError("handleCardFormSubmission", "Something went wrong and the card object wasn't created");
        return;
    }

    const isCardAdded = wallet.addCardToWallet(card.cardNumber);

    if (!isCardAdded) {
        logError("handleCardFormSubmission", "Something went wrong and the card wasn't added to the wallet");
        return;
    }


    // add a couple of things amount = 0 since the card is newly created, the name of the card
    parsedFormData.bankName   = "EUSBC";
    parsedFormData.cardAmount = `£0.00`;

    const cardCard = cards.createCardDiv(parsedFormData);

    if (!cardCard) {
        logError("handleCardFormSubmission", "Something went wrong and the HTML card wasn't created");
        return;
    }

    if (isSubmitButtonClick) {
        const isPlaced = cards.placeCardDivIn(cardsDiv, cardCard);
        if (isPlaced) {
            cardFormElement.reset();
            showFormErrorMsg(false, '');
            isSubmitButtonClick = false;
            console.log("Added a card")
        }
    }
  
    

 
   
}

  
}

function showFormErrorMsg(show=true, msg) {
    if (msg) {
        formMsgErrorElement.textContent = msg;
    }

    show ? formMsgErrorElement.classList.add("show") : formMsgErrorElement.classList.remove("show");
 
}


export function handleAddNewCardInputFields(e) {

    const CARD_INPUT_ID      = "card-number";
    const CARD_INPUT_NAME_ID = "cardholder-name"

    if (e.target.id != CARD_INPUT_ID && e.target.id != CARD_INPUT_NAME_ID) {
        return;
    }

    if (e.target.id === CARD_INPUT_ID) {
        applyDashToInput(e, 4, true);
        return;
    }

    const includeChars = ["-", " "]
    e.target.value = sanitizeText(e.target.value, false, true, includeChars); // text, no numbers, only chars, special chars to include
   

}


function validatePageElements() {
    checkIfHTMLElement(cardFormElement, "The card form element");
    checkIfHTMLElement(formMsgErrorElement, "The form message element");
    checkIfHTMLElement(cardNumberInputElement, "The card number element");
    checkIfHTMLElement(submitBtnElement, "The submit for creating card")
}

