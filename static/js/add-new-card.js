
import { checkIfHTMLElement, dimBackground, applyDashToInput, sanitizeText, toggleSpinner  } from "./utils.js";
import { parseFormData } from "./formUtils.js";
import { Card } from "./card.js";
import { cards } from "./cardsComponent.js";
import { AlertUtils } from "./alerts.js";
import { logError } from "./logger.js";


const cardFormElement        = document.getElementById("card-form");
const formMsgErrorElement    = document.getElementById("new-card-error-msg");
const cardNumberInputElement =  document.getElementById("card-number");
const cardDisplayArea        = document.getElementById("cards")
const submitBtnElement       = document.getElementById("create-card-btn");
const spinnerElement         = document.querySelector(".spinner3")

validatePageElements();

let isSubmitButtonClick = false;


cardFormElement.addEventListener("submit", handleCardFormSubmission);
submitBtnElement.addEventListener("click", handleSubmitBtnClick);



export function handleCardFormSubmission(e, wallet) {

    e.preventDefault();

    if (!cardFormElement.checkValidity() && isSubmitButtonClick) {

        isSubmitButtonClick = false;
        showFormErrorMsg(true, "One or more of the fields are invalid");
        return;
    }

    if (isSubmitButtonClick) {

        const parsedCardData = getParsedCardFormData();
        const card           = generateCardFromParsedData(parsedCardData);

        if (!card) {
            logError("handleCardFormSubmission", "something went wrong and the card was created - likely card already exists");
            return;
        }

        if (!addCardToUIWallet(wallet, card)) {
            return;
        }
        
        const cardComponentElement = cards.createCardDiv(parsedCardData);

        if (!cardComponentElement) {
            logError("handleCardFormSubmission", "Something went wrong and the HTML card wasn't created");
            return;
        }

        if (isSubmitButtonClick) {

            const TIME_IN_MS = 1000;
            const isPlaced   = cards.placeCardDivIn(cardDisplayArea, cardComponentElement);

            toggleSpinner(spinnerElement, isSubmitButtonClick)
            disableCreateButton(isSubmitButtonClick);

            setTimeout(() => {

                if (isPlaced) {

                    cardFormElement.reset();
                    showFormErrorMsg(false, '');

                    isSubmitButtonClick = false;
                    toggleSpinner(spinnerElement, isSubmitButtonClick)
                    disableCreateButton(isSubmitButtonClick);

                    AlertUtils.showAlert({
                        title: "Card Created Successfully",
                        text: "Your card has been created and added to your wallet.",
                        icon: "success",
                        confirmButtonText: "Great!"
                    });
                    
                }
            }, TIME_IN_MS)
        
        }
    
    
    }

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


function addCardToUIWallet(wallet, card) {
   
    try {
        const isCardAdded = wallet.addCardToWallet(card.cardNumber);
        if (!isCardAdded) {
            const error = "Something went wrong and the card wasn't added to the wallet";
            logError("handleCardFormSubmission", error);
            showFormErrorMsg(true, error)
            return false;
        }
        return true;
    } catch (error) {
        showFormErrorMsg(true, error.message);
        return false
    }

    
}


function handleSubmitBtnClick(e) {
    const CREATE_CARD_BTN_ID = "create-card-btn";

    if (e.target.id === CREATE_CARD_BTN_ID) {
        isSubmitButtonClick = true;
    }
}


function getParsedCardFormData() {

    const formData       = new FormData(cardFormElement);
    const requiredFields = [
                "card-name",
                "card-number",
                "expiry-month",
                "expiry-year",
                "card-option",
                "card-type",
                "cvc"
        
            ];

    const parsedFormData      = parseFormData(formData, requiredFields);
    parsedFormData.bankName   = "EUSBC";
    parsedFormData.cardAmount = `£0.00`;
    return parsedFormData;

}


function generateCardFromParsedData(parsedCardData) {

    try {
       return Card.createCard(parsedCardData.cardName, 
            parsedCardData.cardNumber, 
            parsedCardData.expiryMonth,
            parsedCardData.expiryYear,
            parsedCardData.cvc,
            )
        
    } catch (error) {
        // showFormErrorMsg(true, error.message);
        return false;
    }
}


function showFormErrorMsg(show=true, msg) {
    if (msg) {
        formMsgErrorElement.textContent = msg;
    }

    show ? formMsgErrorElement.classList.add("show") : formMsgErrorElement.classList.remove("show");
 
}


function disableCreateButton(disable=true) {
    submitBtnElement.disabled      = disable;
    submitBtnElement.style.opacity = disable ? "0.4" : "1";
}




function validatePageElements() {
    checkIfHTMLElement(cardFormElement, "The card form element");
    checkIfHTMLElement(formMsgErrorElement, "The form message element");
    checkIfHTMLElement(cardNumberInputElement, "The card number element");
    checkIfHTMLElement(submitBtnElement, "The submit for creating card");

    
}

