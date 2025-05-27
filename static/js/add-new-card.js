
import { checkIfHTMLElement, dimBackground, applyDashToInput, sanitizeText, toggleSpinner } from "./utils.js";
import { parseFormData } from "./formUtils.js";
import { Card } from "./card.js";
import { cards } from "./cardsComponent.js";
import { AlertUtils } from "./alerts.js";
import { logError } from "./logger.js";
import { notificationManager } from "./notificationManager.js";
import { config } from "./config.js";
import { warnError } from "./logger.js";
import { walletDashboard } from "./walletUI.js";



const cardFormElement         = document.getElementById("card-form");
const formMsgErrorElement     = document.getElementById("new-card-error-msg");
const cardNumberInputElement  = document.getElementById("card-number");
const cardDisplayArea         = document.getElementById("cards")
const submitBtnElement        = document.getElementById("create-card-btn");
const spinnerElement          = document.querySelector(".spinner3");
const addCardCloseIconElement = document.getElementById("window-close-icon");
const newCardDivElement       = document.getElementById("new-card");
const dimBackgroundElement    = document.querySelector(".dim-background");



validatePageElements();

let isSubmitButtonClick = true;


cardFormElement.addEventListener("submit", handleCardFormSubmission);
submitBtnElement.addEventListener("click", handleSubmitBtnClick);


notificationManager.setKey(config.NOTIFICATION_KEY);


export async function handleCardFormSubmission(e, wallet) {

    e.preventDefault();
    const CREATE_CARD_BTN_ID = "create-card-btn";

    if (!cardFormElement.checkValidity()) {
      
        if (e.target.id === CREATE_CARD_BTN_ID) {
            showFormErrorMsg(true, "One or more of the fields are invalid");
        }
      
        isSubmitButtonClick = false;
       
    }

    if (isSubmitButtonClick) {

        const EXPECTED_CARD_NUMBER_LENGTH = 16;

        const parsedCardData     = getParsedCardFormData();   
        const CARD_NUMBER_LENGTH = parsedCardData.cardNumber.split("-").join("").trim().length;

        if (CARD_NUMBER_LENGTH != EXPECTED_CARD_NUMBER_LENGTH) {
            const character     = CARD_NUMBER_LENGTH > 1 ? "s" : "";
            const error         = `The card length must be sixteen characters. Got ${CARD_NUMBER_LENGTH} char${character}`;
            isSubmitButtonClick = false;
            showFormErrorMsg(true, error);
            return;
        }

        let card;

        try {
            card = generateCardFromParsedData(parsedCardData);
        } catch (error) {
            const resp = await AlertUtils.showConfirmationAlert({
                confirmButtonText: "Load Card",
                denyButtonText: "Cancel",
                title: "An existing card is already in the system. Do you want to load it into the wallet?",
                cancelMessage: "The card was not loaded.",
                messageToDisplayOnSuccess: "Card successfully loaded.",
                icon: "info",
            
            });

            if (resp) {
                card = Card.getByCardNumber(parsedCardData.cardNumber);
               
            } else {
                card = false;
            }
        }

        if (!card) {
            isSubmitButtonClick = false;
            logError("handleCardFormSubmission", "something went wrong and the card wasn't was created");
            return;
        }

        if (!addCardToUIWallet(wallet, card)) {
            isSubmitButtonClick = false;
            return;
        }

        const TIME_IN_MS = 1000;
        const isPlaced   = showCardInUIWallet(parsedCardData, cardDisplayArea);

        toggleSpinner(spinnerElement, isSubmitButtonClick)
        disableCreateButton(isSubmitButtonClick);

        setTimeout(() => {

            if (isPlaced) {

                cardFormElement.reset();
                isSubmitButtonClick = false;
                toggleSpinner(spinnerElement, isSubmitButtonClick)
                disableCreateButton(isSubmitButtonClick);

                const notificationMsg = `A new card with the number #${parsedCardData.cardNumber} has been added to your account`;
                notificationManager.add(notificationMsg);
                
                walletDashboard.updateNumOfCardsText(wallet);
                
                AlertUtils.showAlert({
                    title: "Card Created Successfully",
                    text: "Your card has been added to your wallet, and a notification has been sent.",
                    icon: "success",
                    confirmButtonText: "Great!"
                });
                
            }
        }, TIME_IN_MS)

    }

}


export function handleAddNewCardInputFields(e) {

    const CARD_INPUT_ID      = "card-number";
    const CARD_INPUT_NAME_ID = "cardholder-name";

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


export function handleCVCInputField(e) {
    const CARD_CVC_ID  = "cvc";
    if (e.target.id === CARD_CVC_ID) {
        e.target.value =  sanitizeText(e.target.value, true) // only numbers
    }
}


function addCardToUIWallet(wallet, card) {

    try {

          
        const isCardAdded = wallet.addCardToWallet(card.cardNumber);
      
        if (!isCardAdded) {
            
            const error = `Something went wrong and the card wasn't added to the wallet. Tried to add card number ${card} `;
            logError("handleCardFormSubmission", error);
            showFormErrorMsg(true, error.message);
            return false;
        }

        // Trigger a load from localStorage when the user clicks the "Transfer Funds" button.
        // This ensures that the cards are available on the transfer page without requiring a page refresh.
        // Without this, the cards will only appear after a manual refresh.
        config.loadFromCache = false;

        showFormErrorMsg(true, `Card with ${card.cardNumber} has been added`);
        return true;

    } catch (error) {
        const error1 = "You can only store a maximum of three cards.";
        const error2 = "This card is already added to the wallet.";
        const pattern = /^Expected a card number in form of a string but got card number with .*/;
        const pattern2 = /^Cannot set properties of undefined \(setting '.*'\)$/;

        if (error.message.trim() === error1 || error.message.trim() === error2 || pattern.test(error.message)) {
            logError("handleCardFormSubmission", error);
            showFormErrorMsg(true, error.message);
            return false;
        }

        if (pattern2.test(error.message)) {
            warnError("addCardToUIWallet", "An occurred because the wallet in the localstorage is out of sync")
            showFormErrorMsg(true, "Oops something went wrong, refresh your web page and try again.");
            AlertUtils.showAlert({title: "An error occurred",
                                  text: "Oops something went wrong, refresh your web page and try again.",
                                  icon: "error",
                                  confirmButtonText: "Sorry!",

            })
            removeWalletFromStorage();
            return false;
        }

        showFormErrorMsg(true, error.message);
        return false;
       
       

    }


}


/**
 * Removes wallet data from localStorage without affecting other stored items.
 * 
 * This function checks if the wallet key exists before removing it to avoid unnecessary operations. 
 * It ensures that only wallet-related data is deleted, and nothing else.
 *
 * Usage:
 * removeWalletFromStorage(); // Safely removes wallet data
 */
export function removeWalletFromStorage() {
    if (localStorage.getItem(config.WALLET_STORAGE_KEY) !== null) {
        localStorage.removeItem(config.WALLET_STORAGE_KEY);
        console.log("Wallet data removed successfully.");
    } else {
        warnError("removeWalletFromStorage", "No wallet data found in storage.");
    }
}



function handleSubmitBtnClick(e) {
    const CREATE_CARD_BTN_ID = "create-card-btn";

    if (e.target.id === CREATE_CARD_BTN_ID) {
        isSubmitButtonClick = true;
    }
}


function getParsedCardFormData() {

    const formData = new FormData(cardFormElement);
    const requiredFields = [
        "card-name",
        "card-number",
        "expiry-month",
        "expiry-year",
        "card-brand",
        "card-type",
        "cvc"

    ];

    const parsedFormData = parseFormData(formData, requiredFields);
    parsedFormData.bankName = "EUSBC";
    parsedFormData.cardAmount = `£0.00`;
    return parsedFormData;

}


function generateCardFromParsedData(parsedCardData) {

    if (!parsedCardData || typeof parsedCardData !== 'object') {
        console.error("Invalid card data provided.");
        return false;
    }

    try {
        return Card.createCard(parsedCardData.cardName,
            parsedCardData.cardNumber,
            parsedCardData.expiryMonth,
            parsedCardData.expiryYear,
            parsedCardData.cvc,
            parsedCardData.cardType,
            parsedCardData.cardBrand,

        )

    } catch (error) {
        showFormErrorMsg(true, error.message);
        throw new Error("Card already exists");
    }
}


function showFormErrorMsg(show = true, msg) {
    if (msg) {
        formMsgErrorElement.textContent = msg;
    }

    show ? formMsgErrorElement.classList.add("show") : formMsgErrorElement.classList.remove("show");

}


function disableCreateButton(disable = true) {
    submitBtnElement.disabled = disable;
    submitBtnElement.style.opacity = disable ? "0.4" : "1";
}


export function showCardInUIWallet(cardData, cardDisplayArea) {

    const cardComponentElement = cards.createCardDiv(cardData);

    if (!cardComponentElement) {
        logError("handleCardFormSubmission", "Something went wrong and the HTML card wasn't created");
        return;
    }
    return cards.placeCardDivIn(cardDisplayArea, cardComponentElement);

}


export function handleNewCardCloseIcon(e) {
    const WINDOW_ICON = "window-close-icon";

    if (e.target.id === WINDOW_ICON ) {
        dimBackground(dimBackgroundElement)
        newCardDivElement.classList.remove("show");
    }
}


/**
 * Shows the new card input form when the "Add New Card" button is clicked.
 *
 * @param {Event} e - The event object from the click event.
 */
export function showNewCardForm(e) {
    const ADD_NEW_CARD_ID = "add-new-card";

    if (e.target.id === ADD_NEW_CARD_ID) {
        newCardDivElement.classList.add("show");
    }
}



function validatePageElements() {

    checkIfHTMLElement(cardFormElement, "The card form element");
    checkIfHTMLElement(formMsgErrorElement, "The form message element");
    checkIfHTMLElement(cardNumberInputElement, "The card number element");
    checkIfHTMLElement(submitBtnElement, "The submit for creating card");
    checkIfHTMLElement(addCardCloseIconElement, "The add form close icon");
    checkIfHTMLElement(newCardDivElement, "The new card div element");
    checkIfHTMLElement(dimBackgroundElement, "Dim background element");
}

